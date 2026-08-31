import { listCategoriesForUser } from "@/repositories/category.repository";

export function listCategories(userId: string) {
  return listCategoriesForUser(userId);
}
