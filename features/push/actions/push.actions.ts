"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  removePushSubscriptionForUser,
  savePushSubscriptionForUser,
  sendTestPushToUser,
} from "@/services/push/push.service";

const subscriptionSchema = z.object({
  endpoint: z.url("Suscripción inválida."),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado.");
  }
  return session.user.id;
}

function toErrorResult(error: unknown) {
  return {
    success: false as const,
    error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
  };
}

export async function savePushSubscriptionAction(input: unknown) {
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Suscripción inválida." };
  }
  try {
    await savePushSubscriptionForUser(
      await requireUserId(),
      parsed.data.endpoint,
      parsed.data.keys,
    );
    return { success: true as const };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function removePushSubscriptionAction(input: unknown) {
  const parsed = z.object({ endpoint: z.string().min(1) }).safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Suscripción inválida." };
  }
  try {
    await removePushSubscriptionForUser(await requireUserId(), parsed.data.endpoint);
    return { success: true as const };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function sendTestPushAction() {
  try {
    const summary = await sendTestPushToUser(await requireUserId());
    return { success: true as const, summary };
  } catch (error) {
    return toErrorResult(error);
  }
}
