"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  getTodayPlan,
  saveTodayPlan,
  updatePlanItemDetails,
  removePlanItem,
} from "@/services/planning/daily-plan.service";
import { findUserById } from "@/repositories/user.repository";
import { listCategoriesWithSubcategoryCount } from "@/repositories/category.repository";
import { listSubcategoriesByUser } from "@/repositories/subcategory.repository";
import {
  getPracticedCategoryIdsToday,
  findActiveByUserId,
} from "@/repositories/focus-session.repository";

export type ActionResult = { success: true } | { success: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado.");
  }
  return session.user.id;
}

function toErrorResult(error: unknown): { success: false; error: string } {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
  };
}

export type PlanningContextActionResult =
  | {
      success: true;
      context: {
        userName: string;
        categories: {
          id: string;
          name: string;
          icon: string;
          color: string;
          subcategories: {
            id: string;
            name: string;
            icon: string;
            color: string;
          }[];
        }[];
        planItems: {
          id: string;
          title: string;
          icon: string;
          color: string;
          categoryId: string | null;
          subcategoryId: string | null;
          practiced: boolean;
        }[];
      };
    }
  | { success: false; error: string };

export async function getPlanningContextAction(): Promise<PlanningContextActionResult> {
  try {
    const userId = await requireUserId();
    const [user, categories, subcategories, plan, practicedIds] = await Promise.all([
      findUserById(userId),
      listCategoriesWithSubcategoryCount(userId),
      listSubcategoriesByUser(userId),
      getTodayPlan(userId),
      getPracticedCategoryIdsToday(userId, new Date()),
    ]);

    const subcategoriesByCategory = new Map<string, { id: string; name: string; icon: string; color: string }[]>();
    for (const sub of subcategories) {
      const list = subcategoriesByCategory.get(sub.categoryId) ?? [];
      list.push({ id: sub.id, name: sub.name, icon: sub.icon, color: sub.color });
      subcategoriesByCategory.set(sub.categoryId, list);
    }

    return {
      success: true,
      context: {
        userName: user?.name?.split(" ")[0] ?? "",
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          subcategories: subcategoriesByCategory.get(category.id) ?? [],
        })),
        planItems:
          plan?.items.map((item) => ({
            id: item.id,
            title: item.title,
            icon: item.icon,
            color: item.color,
            categoryId: item.categoryId,
            subcategoryId: item.subcategoryId,
            practiced: item.categoryId ? practicedIds.has(item.categoryId) : false,
          })) ?? [],
      },
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function getTodayPlanAction(): Promise<
  | {
      success: true;
      plan: {
        id: string;
        items: {
          id: string;
          title: string;
          icon: string;
          color: string;
          order: number;
          completed: boolean;
          categoryId: string | null;
          categoryName: string;
          categoryIcon: string;
          categoryColor: string;
          subcategoryId: string | null;
          practiced: boolean;
        }[];
      } | null;
      activeSession: {
        id: string;
        categoryId: string;
        subcategoryId: string;
        isPaused: boolean;
      } | null;
    }
  | { success: false; error: string }
> {
  try {
    const userId = await requireUserId();
    const [plan, practicedIds, activeSession] = await Promise.all([
      getTodayPlan(userId),
      getPracticedCategoryIdsToday(userId, new Date()),
      findActiveByUserId(userId),
    ]);

    const active = activeSession
      ? {
          id: activeSession.id,
          categoryId: activeSession.subcategory.categoryId,
          subcategoryId: activeSession.subcategoryId,
          isPaused: activeSession.pausedAt !== null,
        }
      : null;

    if (!plan) return { success: true, plan: null, activeSession: active };

    return {
      success: true,
      plan: {
        id: plan.id,
        items: plan.items.map((item) => ({
          id: item.id,
          title: item.title,
          icon: item.icon,
          color: item.color,
          order: item.order,
          completed: item.completed,
          categoryId: item.categoryId,
          categoryName: item.category?.name ?? "",
          categoryIcon: item.category?.icon ?? item.icon,
          categoryColor: item.category?.color ?? item.color,
          subcategoryId: item.subcategoryId,
          practiced: item.categoryId ? practicedIds.has(item.categoryId) : false,
        })),
      },
      activeSession: active,
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function saveTodayPlanAction(
  items: {
    title: string;
    icon: string;
    color: string;
    categoryId?: string | null;
    subcategoryId?: string | null;
    order: number;
  }[],
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await saveTodayPlan(userId, items);
    revalidatePath("/app/home");
    return { success: true };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function updatePlanItemAction(
  itemId: string,
  data: { title?: string; icon?: string; color?: string; completed?: boolean },
): Promise<ActionResult> {
  try {
    await updatePlanItemDetails(itemId, data);
    revalidatePath("/app/home");
    return { success: true };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function deletePlanItemAction(itemId: string): Promise<ActionResult> {
  try {
    await removePlanItem(itemId);
    revalidatePath("/app/home");
    return { success: true };
  } catch (error) {
    return toErrorResult(error);
  }
}
