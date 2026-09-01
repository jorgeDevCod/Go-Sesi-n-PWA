import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function listSubcategoriesByUser(userId: string, categoryId?: string) {
  return prisma.subcategory.findMany({
    where: { userId, deletedAt: null, ...(categoryId ? { categoryId } : {}) },
    orderBy: { order: "asc" },
  });
}

export function findSubcategoryById(id: string) {
  return prisma.subcategory.findUnique({
    where: { id },
    include: { category: true },
  });
}

export function createSubcategory(
  data: Prisma.SubcategoryCreateInput,
  tx: Prisma.TransactionClient = prisma,
) {
  return tx.subcategory.create({ data });
}

export function createManySubcategories(
  data: Prisma.SubcategoryCreateManyInput[],
  tx: Prisma.TransactionClient = prisma,
) {
  return tx.subcategory.createMany({ data });
}

export function updateSubcategory(
  id: string,
  data: Prisma.SubcategoryUpdateInput,
) {
  return prisma.subcategory.update({ where: { id }, data });
}

export function deleteSubcategory(id: string) {
  return prisma.subcategory.delete({ where: { id } });
}

export function softDeleteSubcategory(id: string, userId: string) {
  return prisma.subcategory.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });
}

export function restoreSubcategory(id: string, userId: string) {
  return prisma.subcategory.updateMany({
    where: { id, userId },
    data: { deletedAt: null },
  });
}

/** Devuelve las actividades eliminadas (papelera) del usuario. */
export function listDeletedSubcategoriesForUser(userId: string) {
  return prisma.subcategory.findMany({
    where: { userId, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    include: { category: true },
  });
}

/** Actividades en papelera dentro de una categoría (para borrar con la categoría). */
export function listDeletedSubcategoriesForCategory(categoryId: string) {
  return prisma.subcategory.findMany({
    where: { categoryId, deletedAt: { not: null } },
    select: { id: true },
  });
}

/** Cuenta actividades activas de un conjunto de categorías (para saber si están vacías). */
export function countActiveSubcategoriesInCategories(categoryIds: string[]) {
  return prisma.subcategory.count({
    where: { categoryId: { in: categoryIds }, deletedAt: null },
  });
}

export async function updateSubcategoryOrders(
  updates: { id: string; order: number }[],
  userId: string,
) {
  return prisma.$transaction(
    updates.map(({ id, order }) =>
      prisma.subcategory.updateMany({
        where: { id, userId },
        data: { order },
      }),
    ),
  );
}
