import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function listCategoriesForUser(userId: string) {
  return prisma.category.findMany({
    where: { userId, deletedAt: null },
    orderBy: { order: "asc" },
  });
}

export function findCategoryByKeyOrIdForUser(userId: string, keyOrId: string) {
  return prisma.category.findFirst({
    where: { userId, deletedAt: null, OR: [{ key: keyOrId }, { id: keyOrId }] },
  });
}

export function findCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export function createCategory(data: Prisma.CategoryCreateInput) {
  return prisma.category.create({ data });
}

export function updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
  return prisma.category.update({ where: { id }, data });
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export function softDeleteCategory(id: string, userId: string) {
  return prisma.category.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });
}

export function restoreCategory(id: string, userId: string) {
  return prisma.category.updateMany({
    where: { id, userId },
    data: { deletedAt: null },
  });
}

export function countSubcategoriesForCategory(categoryId: string) {
  return prisma.subcategory.count({ where: { categoryId, deletedAt: null } });
}

export function countCategoriesForUser(userId: string) {
  return prisma.category.count({ where: { userId, deletedAt: null } });
}

export function listCategoriesWithSubcategoryCount(userId: string) {
  return prisma.category.findMany({
    where: { userId, deletedAt: null },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { subcategories: true } },
    },
  });
}

/** Devuelve las categorías eliminadas (papelera) del usuario, con actividad = categoría. */
export function listDeletedCategoriesForUser(userId: string) {
  return prisma.category.findMany({
    where: { userId, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
  });
}

/** Cuenta los items de papelera del usuario para aplicar el límite de 50. */
export function countDeletedForUser(userId: string) {
  return prisma.$transaction([
    prisma.category.count({ where: { userId, deletedAt: { not: null } } }),
    prisma.subcategory.count({ where: { userId, deletedAt: { not: null } } }),
  ]);
}

/** Toma los ids de las categorías eliminadas más antiguas (para purgar por límite de 50). */
export function oldestDeletedCategoryIds(userId: string, take: number) {
  return prisma.category.findMany({
    where: { userId, deletedAt: { not: null } },
    orderBy: { deletedAt: "asc" },
    select: { id: true },
    take,
  });
}
