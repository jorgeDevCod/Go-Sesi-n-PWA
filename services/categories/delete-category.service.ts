import { verifyPassword } from "@/lib/password";
import { findUserById } from "@/repositories/user.repository";
import {
  countSubcategoriesForCategory,
  findCategoryById,
  softDeleteCategory,
} from "@/repositories/category.repository";
import {
  CategoryForbiddenError,
  CategoryHasSubcategoriesError,
  CategoryNotFoundError,
  InvalidPasswordError,
  PasswordRequiredError,
} from "./category.errors";

export async function deleteCategoryForUser(
  id: string,
  userId: string,
  password?: string,
) {
  const category = await findCategoryById(id);
  if (!category) throw new CategoryNotFoundError();
  if (category.userId !== userId) throw new CategoryForbiddenError();

  const subcategoryCount = await countSubcategoriesForCategory(id);
  if (subcategoryCount > 0) throw new CategoryHasSubcategoriesError();

  if (category.isDefault) {
    if (!password) throw new PasswordRequiredError();

    const user = await findUserById(userId);
    const validPassword = user ? await verifyPassword(password, user.passwordHash) : false;
    if (!validPassword) throw new InvalidPasswordError();
  }

  await softDeleteCategory(id, userId);
}
