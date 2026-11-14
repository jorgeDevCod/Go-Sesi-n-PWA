"use client";

import { isStandalonePwa } from "@/lib/pwa";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, "+").replace(/_/g, "/") + padding);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * Crea/renueva la suscripción push solo desde la PWA instalada.
 * En navegador web no pide permiso ni registra nada.
 */
export async function ensurePushSubscription(): Promise<boolean> {
  if (!PUBLIC_KEY || !isStandalonePwa()) return false;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
  if (typeof Notification === "undefined") return false;

  try {
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") return false;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
      });
    }

    const keys = subscription.toJSON().keys;
    if (!keys?.p256dh || !keys?.auth) return false;

    const { savePushSubscriptionAction } = await import(
      "@/features/push/actions/push.actions"
    );
    const result = await savePushSubscriptionAction({
      endpoint: subscription.endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
    });
    return result.success;
  } catch {
    return false;
  }
}
