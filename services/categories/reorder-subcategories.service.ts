import { toOrderedUpdates } from "@/lib/order";
import {
  listSubcategoriesByUser,
  updateSubcategoryOrders,
} from "@/repositories/subcategory.repository";
import { SubcategoryForbiddenError } from "./subcategory.errors";

type ReorderInput = {
  userId: string;
  categoryId: string;
  orderedIds: string[];
};

export async function reorderSubcategoriesForUser({
  userId,
  categoryId,
  orderedIds,
}: ReorderInput) {
  const owned = await listSubcategoriesByUser(userId, categoryId);
  const ownedIds = new Set(owned.map((s) => s.id));

  const isValidSet =
    orderedIds.length === owned.length &&
    orderedIds.every((id) => ownedIds.has(id));

  if (!isValidSet) {
    throw new SubcategoryForbiddenError();
  }

  const updates = toOrderedUpdates(orderedIds);
  await updateSubcategoryOrders(updates, userId);
}
