import {
  findPlanByUserAndDate,
  createPlan,
  updatePlanItems,
  updatePlanItem,
  deletePlanItem,
} from "@/repositories/planning.repository";

export type PlanItemInput = {
  title: string;
  icon: string;
  color: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  order: number;
};

function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
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

export async function updatePlanItemDetails(
  itemId: string,
  data: { title?: string; icon?: string; color?: string; completed?: boolean },
) {
  return updatePlanItem(itemId, data);
}

export async function removePlanItem(itemId: string) {
  return deletePlanItem(itemId);
}
