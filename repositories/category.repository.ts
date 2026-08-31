import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function listCategoriesForUser(userId: string) {
  return prisma.category.findMany({ where: { userId }, orderBy: { order: "asc" } });
}

export function findCategoryByKeyOrIdForUser(userId: string, keyOrId: string) {
  return prisma.category.findFirst({
    where: { userId, OR: [{ key: keyOrId }, { id: keyOrId }] },
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

export function countSubcategoriesForCategory(categoryId: string) {
  return prisma.subcategory.count({ where: { categoryId } });
}

export function countCategoriesForUser(userId: string) {
  return prisma.category.count({ where: { userId } });
}

export function listCategoriesWithSubcategoryCount(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    include: { _count: { select: { subcategories: true } } },
  });
}
