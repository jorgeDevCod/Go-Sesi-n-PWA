import { Prisma } from "@/lib/generated/prisma/client";
import {
  countCategoriesForUser,
  createCategory,
} from "@/repositories/category.repository";
import { DuplicateCategoryNameError } from "./category.errors";
import type { Complexity } from "@/lib/constants/default-subcategories";

type CreateCategoryInput = {
  userId: string;
  name: string;
  icon: string;
  color: string;
  complexity?: Complexity;
  energyLevel?: string | null;
  energyComplexity?: Complexity | null;
};

export async function createCategoryForUser({
  userId,
  name,
  icon,
  color,
  complexity = "MEDIUM",
  energyLevel,
  energyComplexity,
}: CreateCategoryInput) {
  const order = await countCategoriesForUser(userId);

  try {
    return await createCategory({
      name,
      icon,
      color,
      order,
      isDefault: false,
      complexity,
      energyLevel,
      energyComplexity,
      user: { connect: { id: userId } },
    });
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
