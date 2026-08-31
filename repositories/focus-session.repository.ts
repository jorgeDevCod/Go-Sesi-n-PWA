import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function findActiveByUserId(userId: string) {
  return prisma.focusSession.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { subcategory: { include: { category: true } } },
  });
}

export function listSessionsForUser(userId: string) {
  return prisma.focusSession.findMany({
    where: { userId, status: { in: ["COMPLETED", "INTERRUPTED"] } },
    include: { subcategory: { include: { category: true } } },
    orderBy: { startedAt: "desc" },
  });
}

export async function getLastPracticedAtBySubcategory(
  userId: string,
): Promise<Map<string, Date>> {
  const rows = await prisma.focusSession.groupBy({
    by: ["subcategoryId"],
    where: { userId, status: { in: ["COMPLETED", "INTERRUPTED"] } },
    _max: { startedAt: true },
  });

  const map = new Map<string, Date>();
  for (const row of rows) {
    if (row._max.startedAt) map.set(row.subcategoryId, row._max.startedAt);
  }
  return map;
}

export async function getFocusStatsForUser(userId: string) {
  const rows = await prisma.focusSession.findMany({
    where: { userId, status: "COMPLETED" },
    select: { actualMinutes: true, plannedMinutes: true },
  });

  const completedSessions = rows.length;
  const totalMinutes = rows.reduce(
    (sum, row) => sum + (row.actualMinutes ?? row.plannedMinutes),
    0,
  );
  return { completedSessions, totalMinutes };
}

/** Nombre de la última subcategoría practicada (COMPLETED o INTERRUPTED). */
export async function getLastSubcategoryName(userId: string): Promise<string | null> {
  const last = await prisma.focusSession.findFirst({
    where: { userId, status: { in: ["COMPLETED", "INTERRUPTED"] } },
    orderBy: { startedAt: "desc" },
    select: { subcategory: { select: { name: true } } },
  });
  return last?.subcategory?.name ?? null;
}

/**
 * Category ids that had at least one session (completed or interrupted)
 * started on the same calendar day as `date` (UTC-midnight day boundary,
 * matching the daily plan's `getTodayDate`). Used to derive "practicada
 * hoy" on the daily plan.
 */
export async function getPracticedCategoryIdsToday(
  userId: string,
  date: Date,
): Promise<Set<string>> {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const rows = await prisma.focusSession.findMany({
    where: {
      userId,
      status: { in: ["COMPLETED", "INTERRUPTED"] },
      startedAt: { gte: start, lt: end },
    },
    select: { subcategory: { select: { categoryId: true } } },
  });

  return new Set(rows.map((row) => row.subcategory.categoryId));
}

export function findById(id: string) {
  return prisma.focusSession.findUnique({
    where: { id },
    include: { subcategory: { include: { category: true } } },
  });
}

export function createSession(data: Prisma.FocusSessionCreateInput) {
  return prisma.focusSession.create({
    data,
    include: { subcategory: { include: { category: true } } },
  });
}

export function updateSession(id: string, data: Prisma.FocusSessionUpdateInput) {
  return prisma.focusSession.update({
    where: { id },
    data,
    include: { subcategory: { include: { category: true } } },
  });
}

export function deleteSession(id: string) {
  return prisma.focusSession.delete({ where: { id } });
}
