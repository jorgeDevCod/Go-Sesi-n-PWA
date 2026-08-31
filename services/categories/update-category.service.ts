import { Prisma } from "@/lib/generated/prisma/client";
import {
  findCategoryById,
  updateCategory,
} from "@/repositories/category.repository";
import {
  CategoryForbiddenError,
  CategoryNotFoundError,
  DuplicateCategoryNameError,
} from "./category.errors";
import type { Complexity } from "@/lib/constants/default-subcategories";

type UpdateCategoryInput = {
  id: string;
  userId: string;
  name?: string;
  icon?: string;
  color?: string;
  complexity?: Complexity;
};

export async function updateCategoryForUser({ id, userId, ...data }: UpdateCategoryInput) {
  const existing = await findCategoryById(id);
  if (!existing) throw new CategoryNotFoundError();
  if (existing.userId !== userId) throw new CategoryForbiddenError();

  try {
    return await updateCategory(id, data);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateCategoryNameError();
    }
    throw error;
  }
}
