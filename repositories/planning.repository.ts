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

/** Todos los planes del usuario (para exportar datos), más recientes primero. */
export function listPlansForUser(userId: string) {
  return prisma.dailyPlan.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { items: { orderBy: { order: "asc" } } },
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

export function findPlanItemById(itemId: string) {
  return prisma.planItem.findUnique({
    where: { id: itemId },
    include: { plan: { select: { userId: true } } },
  });
}

export function updatePlanItem(
  itemId: string,
  // Sin `completed`: el badge Realizada se deriva de sesiones reales (1B).
  data: { title?: string; icon?: string; color?: string },
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
