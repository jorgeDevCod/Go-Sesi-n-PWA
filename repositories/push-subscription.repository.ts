import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function listPushSubscriptionsForUser(userId: string) {
  return prisma.pushSubscription.findMany({ where: { userId } });
}

export function upsertPushSubscription(
  userId: string,
  endpoint: string,
  keys: Prisma.InputJsonValue,
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, keys },
    update: { userId, keys },
  });
}

export function deletePushSubscription(userId: string, endpoint: string) {
  return prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
}

export function deletePushSubscriptionByEndpoint(endpoint: string) {
  return prisma.pushSubscription.deleteMany({ where: { endpoint } });
}
