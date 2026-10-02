import { prisma } from "@/lib/prisma";

/** Mapa subcategoryId → 1 | -1 del usuario. */
export async function getFeedbackMap(userId: string): Promise<Map<string, 1 | -1>> {
  const rows = await prisma.recommendationFeedback.findMany({
    where: { userId },
    select: { subcategoryId: true, value: true },
  });
  const map = new Map<string, 1 | -1>();
  for (const row of rows) {
    if (row.value === 1 || row.value === -1) map.set(row.subcategoryId, row.value);
  }
  return map;
}

export function setFeedback(userId: string, subcategoryId: string, value: 1 | -1) {
  return prisma.recommendationFeedback.upsert({
    where: { userId_subcategoryId: { userId, subcategoryId } },
    create: { userId, subcategoryId, value },
    update: { value },
  });
}

export function clearFeedback(userId: string, subcategoryId: string) {
  return prisma.recommendationFeedback.deleteMany({
    where: { userId, subcategoryId },
  });
}
