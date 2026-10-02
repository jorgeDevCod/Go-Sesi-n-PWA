import { findSubcategoryById } from "@/repositories/subcategory.repository";
import {
  clearFeedback,
  getFeedbackMap,
  setFeedback,
} from "@/repositories/recommendation-feedback.repository";
import {
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "@/services/categories/subcategory.errors";

export type FeedbackValue = 1 | -1;

/**
 * Guarda (o quita con null) el feedback de una actividad propia.
 * 👎 excluye la actividad del ranking; 👍 la impulsa.
 */
export async function saveFeedbackForUser(
  userId: string,
  subcategoryId: string,
  value: FeedbackValue | null,
) {
  const sub = await findSubcategoryById(subcategoryId);
  if (!sub) throw new SubcategoryNotFoundError();
  if (sub.userId !== userId) throw new SubcategoryForbiddenError();
  if (value === null) {
    await clearFeedback(userId, subcategoryId);
    return null;
  }
  if (value !== 1 && value !== -1) {
    throw new Error("Feedback inválido.");
  }
  await setFeedback(userId, subcategoryId, value);
  return value;
}

export async function getFeedbackMapForUser(userId: string) {
  return getFeedbackMap(userId);
}
