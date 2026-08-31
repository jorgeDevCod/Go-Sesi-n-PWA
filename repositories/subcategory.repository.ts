import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function listSubcategoriesByUser(userId: string, categoryId?: string) {
  return prisma.subcategory.findMany({
    where: { userId, ...(categoryId ? { categoryId } : {}) },
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
