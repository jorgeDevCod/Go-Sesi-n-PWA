import { Prisma } from "@/lib/generated/prisma/client";
import {
  createSubcategory,
  listSubcategoriesByUser,
} from "@/repositories/subcategory.repository";
import { DuplicateSubcategoryNameError } from "./subcategory.errors";
import type { Complexity } from "@/lib/constants/default-subcategories";

type CreateSubcategoryInput = {
  userId: string;
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  complexity?: Complexity;
  energyLevel?: string | null;
  energyComplexity?: Complexity | null;
};

export async function createSubcategoryForUser(input: CreateSubcategoryInput) {
  const existing = await listSubcategoriesByUser(input.userId, input.categoryId);
  const nextOrder = existing.length;

  try {
    return await createSubcategory({
      name: input.name,
      icon: input.icon,
      color: input.color,
      complexity: input.complexity ?? "MEDIUM",
      energyLevel: input.energyLevel,
      energyComplexity: input.energyComplexity,
      order: nextOrder,
      category: { connect: { id: input.categoryId } },
      user: { connect: { id: input.userId } },
    });
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
