import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function findPreferenceByUserId(userId: string) {
  return prisma.userPreference.findUnique({ where: { userId } });
}

export type PreferenceWrite = {
  energy?: string | null;
  preferredMinutes?: number | null;
  dontAskAgain?: boolean;
  data?: Prisma.InputJsonValue;
};

export function upsertPreference(userId: string, data: PreferenceWrite) {
  return prisma.userPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
