import { prisma } from "@/lib/prisma";

export type PlanItemData = {
  id: string;
  title: string;
  icon: string;
  color: string;
  order: number;
  completed: boolean;
  categoryId: string | null;
  subcategoryId: string | null;
};

export type DailyPlanData = {
  id: string;
  userId: string;
  date: Date;
  items: PlanItemData[];
};

export function findPlanByUserAndDate(userId: string, date: Date) {
  return prisma.dailyPlan.findUnique({
    where: { userId_date: { userId, date } },
    include: { items: { orderBy: { order: "asc" }, include: { category: true } } },
  });
}

export type PlanItemWrite = {
  title: string;
  icon: string;
  color: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  order: number;
};

export function createPlan(userId: string, date: Date, items: PlanItemWrite[]) {
  return prisma.dailyPlan.create({
    data: {
      userId,
      date,
      items: {
        create: items.map((item) => ({
          title: item.title,
          icon: item.icon,
          color: item.color,
          categoryId: item.categoryId ?? null,
          subcategoryId: item.subcategoryId ?? null,
          order: item.order,
        })),
      },
    },
    include: { items: { orderBy: { order: "asc" } } },
  });
}

export function updatePlanItems(planId: string, items: PlanItemWrite[]) {
  return prisma.$transaction(async (tx) => {
    await tx.planItem.deleteMany({ where: { planId } });
    return tx.dailyPlan.update({
      where: { id: planId },
      data: {
        items: {
          create: items.map((item) => ({
            title: item.title,
            icon: item.icon,
            color: item.color,
            categoryId: item.categoryId ?? null,
            subcategoryId: item.subcategoryId ?? null,
            order: item.order,
          })),
        },
      },
      include: { items: { orderBy: { order: "asc" } } },
    });
  });
}

export function updatePlanItem(
  itemId: string,
  data: { title?: string; icon?: string; color?: string; completed?: boolean },
) {
  return prisma.planItem.update({
    where: { id: itemId },
    data,
  });
}

export function deletePlanItem(itemId: string) {
  return prisma.planItem.delete({ where: { id: itemId } });
}

export function deletePlan(planId: string) {
  return prisma.dailyPlan.delete({ where: { id: planId } });
}
