import { prisma } from "@/lib/prisma";
import { TRASH_MAX_ITEMS, TRASH_RETENTION_DAYS, type TrashItem } from "./trash.types";
import {
  countDeletedForUser,
  findCategoryById,
  oldestDeletedCategoryIds,
} from "@/repositories/category.repository";
import {
  findSubcategoryById,
  listDeletedSubcategoriesForCategory,
  restoreSubcategory,
  softDeleteSubcategory,
} from "@/repositories/subcategory.repository";
import {
  restoreCategory,
  softDeleteCategory,
} from "@/repositories/category.repository";
import {
  CategoryForbiddenError,
  CategoryNotFoundError,
} from "./category.errors";
import {
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "./subcategory.errors";

/** Moviliza un item a la papelera aplicando el límite de 50 y la retención de 15 días. */
async function enforceTrashLimits(userId: string) {
  // Retención: purga permanentemente lo que supere los 15 días.
  const retentionCutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.subcategory.deleteMany({
      where: { userId, deletedAt: { not: null, lt: retentionCutoff } },
    }),
    prisma.category.deleteMany({
      where: { userId, deletedAt: { not: null, lt: retentionCutoff } },
    }),
  ]);

  // Límite 50: si se supera, se purgan permanentemente los más antiguos.
  const [categoryCount, subcategoryCount] = await countDeletedForUser(userId);
  let excess = categoryCount + subcategoryCount - TRASH_MAX_ITEMS;
  if (excess <= 0) return;

  // Primero purga subcategorías más antiguas, luego categorías.
  const oldestSubs = await prisma.subcategory.findMany({
    where: { userId, deletedAt: { not: null } },
    orderBy: { deletedAt: "asc" },
    select: { id: true },
    take: excess,
  });
  if (oldestSubs.length > 0) {
    await prisma.subcategory.deleteMany({
      where: { id: { in: oldestSubs.map((s) => s.id) } },
    });
    excess -= oldestSubs.length;
  }
  if (excess > 0) {
    const oldestCats = await oldestDeletedCategoryIds(userId, excess);
    if (oldestCats.length > 0) {
      await prisma.category.deleteMany({
        where: { id: { in: oldestCats.map((c) => c.id) } },
      });
    }
  }
}

export async function softDeleteCategoryToTrash(id: string, userId: string) {
  const category = await findCategoryById(id);
  if (!category) throw new CategoryNotFoundError();
  if (category.userId !== userId) throw new CategoryForbiddenError();
  await softDeleteCategory(id, userId);
  await enforceTrashLimits(userId);
}

export async function softDeleteSubcategoryToTrash(id: string, userId: string) {
  const sub = await findSubcategoryById(id);
  if (!sub) throw new SubcategoryNotFoundError();
  if (sub.userId !== userId) throw new SubcategoryForbiddenError();
  await softDeleteSubcategory(id, userId);
  await enforceTrashLimits(userId);
}

export async function softDeleteManySubcategoriesToTrash(ids: string[], userId: string) {
  for (const id of ids) {
    await softDeleteSubcategoryToTrash(id, userId);
  }
}

export async function listTrash(userId: string): Promise<TrashItem[]> {
  const [categories, subcategories] = await Promise.all([
    prisma.category.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.subcategory.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      include: { category: true },
    }),
  ]);

  return [
    ...categories.map((c) => ({
      kind: "category" as const,
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      deletedAt: c.deletedAt as Date,
    })),
    ...subcategories.map((s) => ({
      kind: "subcategory" as const,
      id: s.id,
      name: s.name,
      icon: s.icon,
      color: s.color,
      deletedAt: s.deletedAt as Date,
      categoryName: s.category.name,
    })),
  ];
}

export async function restoreTrashItems(items: { kind: "category" | "subcategory"; id: string }[], userId: string) {
  for (const item of items) {
    if (item.kind === "category") {
      await restoreCategory(item.id, userId);
    } else {
      await restoreSubcategory(item.id, userId);
    }
  }
}

/** Vacía la papelera por completo (borrado permanente). */
export async function emptyTrash(userId: string) {
  await prisma.$transaction([
    prisma.subcategory.deleteMany({ where: { userId, deletedAt: { not: null } } }),
    prisma.category.deleteMany({ where: { userId, deletedAt: { not: null } } }),
  ]);
}

/** Elimina permanentemente items seleccionados, avisando si alguna subcategoría tiene sesiones. */
export async function permanentlyDeleteTrashItems(
  items: { kind: "category" | "subcategory"; id: string }[],
  userId: string,
): Promise<{ failed: { id: string; reason: string }[] }> {
  const failed: { id: string; reason: string }[] = [];

  for (const item of items) {
    try {
      const existing =
        item.kind === "category"
          ? await findCategoryById(item.id)
          : await findSubcategoryById(item.id);
      if (!existing) continue;

      if (item.kind === "subcategory") {
        // Borra permanentemente: si tiene sesiones (Restrict), Prisma falla con P2003.
        await prisma.subcategory.delete({ where: { id: item.id } });
      } else {
        // Borra sus actividades en papelera (si existen) y luego la categoría.
        const deletedSubs = await listDeletedSubcategoriesForCategory(item.id);
        if (deletedSubs.length > 0) {
          await prisma.subcategory.deleteMany({
            where: { id: { in: deletedSubs.map((s) => s.id) } },
          });
        }
        await prisma.category.delete({ where: { id: item.id } });
      }
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "P2003") {
        failed.push({ id: item.id, reason: "Sesión asociada" });
      } else {
        failed.push({ id: item.id, reason: "No se pudo eliminar" });
      }
    }
  }

  return { failed };
}
