import { Prisma } from "@/lib/generated/prisma/client";
import {
  deleteSubcategory,
  findSubcategoryById,
} from "@/repositories/subcategory.repository";
import {
  SubcategoryForbiddenError,
  SubcategoryHasSessionsError,
  SubcategoryNotFoundError,
} from "./subcategory.errors";

export async function deleteSubcategoryForUser(id: string, userId: string) {
  const existing = await findSubcategoryById(id);
  if (!existing) throw new SubcategoryNotFoundError();
  if (existing.userId !== userId) throw new SubcategoryForbiddenError();

  try {
    await deleteSubcategory(id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new SubcategoryHasSessionsError();
    }
    throw error;
  }
}
