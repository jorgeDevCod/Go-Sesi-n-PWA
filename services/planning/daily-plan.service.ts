import {
  findPlanByUserAndDate,
  findPlanItemById,
  createPlan,
  updatePlanItems,
  updatePlanItem,
  deletePlanItem,
} from "@/repositories/planning.repository";
import { PlanItemForbiddenError, PlanItemNotFoundError } from "./plan-item.errors";
import { dayStartUtcInTimeZone } from "@/lib/day";

/**
 * Zona horaria del "día" de planificación. Sin DST en Lima (UTC-5 fijo);
 * configurable por entorno para otras regiones. El TZ del servidor
 * (Vercel = UTC) ya no desfasa el "hoy" del usuario.
 */
export const PLAN_TIME_ZONE = process.env.APP_TIMEZONE ?? "America/Lima";

export type PlanItemInput = {
  title: string;
  icon: string;
  color: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  order: number;
};

function getTodayDate(now: Date = new Date()): Date {
  return dayStartUtcInTimeZone(now, PLAN_TIME_ZONE);
}

/**
 * Badge "Realizada" por actividad: un item con actividad vinculada solo
 * cuenta como realizado si ESA actividad se practicó hoy. Los items de
 * categoría (sin actividad) conservan el criterio por categoría.
 * Pura y testeable.
 */
export function deriveItemPracticed(
  item: { categoryId?: string | null; subcategoryId?: string | null },
  practicedSubcategoryIds: Set<string>,
  practicedCategoryIds: Set<string>,
): boolean {
  if (item.subcategoryId) return practicedSubcategoryIds.has(item.subcategoryId);
  if (item.categoryId) return practicedCategoryIds.has(item.categoryId);
  return false;
}

export async function getTodayPlan(userId: string) {
  const today = getTodayDate();
  return findPlanByUserAndDate(userId, today);
}

export async function saveTodayPlan(userId: string, items: PlanItemInput[]) {
  const today = getTodayDate();
  const existing = await findPlanByUserAndDate(userId, today);

  if (existing) {
    return updatePlanItems(existing.id, items);
  }

  return createPlan(userId, today, items);
}

async function assertPlanItemOwnership(itemId: string, userId: string) {
  const item = await findPlanItemById(itemId);
  if (!item) throw new PlanItemNotFoundError();
  if (item.plan.userId !== userId) throw new PlanItemForbiddenError();
}

export async function updatePlanItemDetails(
  itemId: string,
  userId: string,
  // Sin `completed`: el badge Realizada se deriva de sesiones reales (1B).
  data: { title?: string; icon?: string; color?: string },
) {
  await assertPlanItemOwnership(itemId, userId);
  return updatePlanItem(itemId, data);
}

export async function removePlanItem(itemId: string, userId: string) {
  await assertPlanItemOwnership(itemId, userId);
  return deletePlanItem(itemId);
}
