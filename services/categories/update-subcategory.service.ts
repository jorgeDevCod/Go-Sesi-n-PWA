import { Prisma } from "@/lib/generated/prisma/client";
import {
  findSubcategoryById,
  updateSubcategory,
} from "@/repositories/subcategory.repository";
import {
  DuplicateSubcategoryNameError,
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "./subcategory.errors";
import type { Complexity } from "@/lib/constants/default-subcategories";

type UpdateSubcategoryInput = {
  id: string;
  userId: string;
  name?: string;
  icon?: string;
  color?: string;
  complexity?: Complexity;
};

export async function updateSubcategoryForUser({
  id,
  userId,
  ...data
}: UpdateSubcategoryInput) {
  const existing = await findSubcategoryById(id);
  if (!existing) throw new SubcategoryNotFoundError();
  if (existing.userId !== userId) throw new SubcategoryForbiddenError();

  try {
    return await updateSubcategory(id, data);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateSubcategoryNameError();
    }
    throw error;
  }
}
