import { prisma } from "@/lib/prisma";

export function findMoodByUserAndDate(userId: string, date: Date) {
  return prisma.dailyMood.findUnique({ where: { userId_date: { userId, date } } });
}

export function upsertMood(userId: string, date: Date, energy: string) {
  return prisma.dailyMood.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, energy },
    update: { energy },
  });
}
