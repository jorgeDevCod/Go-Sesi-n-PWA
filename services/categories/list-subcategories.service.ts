import { listSubcategoriesByUser } from "@/repositories/subcategory.repository";

export function listSubcategories(userId: string, categoryId?: string) {
  return listSubcategoriesByUser(userId, categoryId);
}
