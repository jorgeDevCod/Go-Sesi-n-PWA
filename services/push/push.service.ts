import webpush from "web-push";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  deletePushSubscription,
  deletePushSubscriptionByEndpoint,
  listPushSubscriptionsForUser,
  upsertPushSubscription,
} from "@/repositories/push-subscription.repository";

export type PushKeys = { p256dh: string; auth: string };

function vapidDetails() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:hola@localhost";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

function parseKeys(value: unknown): PushKeys | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.p256dh !== "string" || typeof v.auth !== "string") return null;
  return { p256dh: v.p256dh, auth: v.auth };
}

export class PushNotConfiguredError extends Error {
  constructor() {
    super("Notificaciones push no configuradas.");
    this.name = "PushNotConfiguredError";
  }
}

/** Guarda (o actualiza) la suscripción del navegador del usuario. */
export async function savePushSubscriptionForUser(
  userId: string,
  endpoint: string,
  keys: PushKeys,
) {
  if (!endpoint.startsWith("https://")) {
    throw new Error("Suscripción inválida.");
  }
  return upsertPushSubscription(userId, endpoint, keys as Prisma.InputJsonValue);
}

export async function removePushSubscriptionForUser(userId: string, endpoint: string) {
  return deletePushSubscription(userId, endpoint);
}

export type PushSendSummary = { sent: number; failed: number; pruned: number };

/**
 * Envía un push de prueba a todas las suscripciones del usuario.
 * Limpia las vencidas (410/404). Sin claves VAPID lanza PushNotConfiguredError.
 */
export async function sendTestPushToUser(userId: string): Promise<PushSendSummary> {
  const details = vapidDetails();
  if (!details) throw new PushNotConfiguredError();
  webpush.setVapidDetails(details.subject, details.publicKey, details.privateKey);

  const subs = await listPushSubscriptionsForUser(userId);
  const summary: PushSendSummary = { sent: 0, failed: 0, pruned: 0 };

  await Promise.all(
    subs.map(async (sub) => {
      const keys = parseKeys(sub.keys);
      if (!keys) {
        summary.failed += 1;
        return;
      }
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys },
          JSON.stringify({
            title: "Go Sesión",
            body: "Las notificaciones funcionan. Te avisaremos al terminar tus sesiones.",
          }),
        );
        summary.sent += 1;
      } catch (error: unknown) {
        const status = (error as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) {
          await deletePushSubscriptionByEndpoint(sub.endpoint);
          summary.pruned += 1;
        } else {
          summary.failed += 1;
        }
      }
    }),
  );

  return summary;
}
