import {
  findSubcategoryById,
  softDeleteSubcategory,
} from "@/repositories/subcategory.repository";
import {
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "./subcategory.errors";

export async function deleteSubcategoryForUser(id: string, userId: string) {
  const existing = await findSubcategoryById(id);
  if (!existing) throw new SubcategoryNotFoundError();
  if (existing.userId !== userId) throw new SubcategoryForbiddenError();

  await softDeleteSubcategory(id, userId);
}
