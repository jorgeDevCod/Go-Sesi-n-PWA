"use client";

/**
 * Notificación programada de fin de sesión (segundo plano).
 *
 * Límites honestos de la web móvil: con la app cerrada NO se puede sonar
 * audio personalizado; lo que sí despierta al SW es una notificación
 * programada (Notification Triggers / TimestampTrigger, Chrome Android).
 * Al tocarla se abre `/app/session`. El conteo en sí nunca se pierde porque
 * vive en el servidor (startedAt/pausedMs): al reabrir todo cuadra.
 *
 * Sin soporte o sin permiso: no hace nada (la alarma in-app sigue intacta).
 */

export type CompletionTarget = {
  startedAtMs: number;
  pausedMs: number;
  pausedAtMs: number | null;
  plannedMinutes: number;
};

/**
 * Ms epoch en que termina la sesión, o null si está pausada (reloj
 * congelado: no se sabe cuándo reanudará) o ya vencida.
 * Pura y testeable.
 */
export function completionTargetMs(session: CompletionTarget, nowMs: number): number | null {
  if (session.pausedAtMs !== null) return null;
  const target = session.startedAtMs + session.pausedMs + session.plannedMinutes * 60_000;
  return target > nowMs ? target : null;
}

export function completionTag(sessionId: string): string {
  return `gosession-done-${sessionId}`;
}

type TimestampTriggerCtor = new (time: number) => object;

function getTimestampTrigger(): TimestampTriggerCtor | null {
  if (typeof window === "undefined" || typeof Notification === "undefined") return null;
  if (!("showTrigger" in Notification.prototype)) return null;
  const ctor = (globalThis as unknown as Record<string, unknown>).TimestampTrigger;
  return typeof ctor === "function" ? (ctor as TimestampTriggerCtor) : null;
}

export function supportsScheduledNotifications(): boolean {
  return getTimestampTrigger() !== null;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  try {
    if (!("serviceWorker" in navigator)) return null;
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

/**
 * Programa el aviso de fin. Devuelve true si quedó programado.
 * Llamar en cada cambio (pausa/reanuda/extiende/fin): reprograma o cancela.
 */
export async function scheduleCompletionNotification(args: {
  sessionId: string;
  title: string;
  body: string;
  targetMs: number;
}): Promise<boolean> {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return false;
    }
    const Trigger = getTimestampTrigger();
    const registration = await getRegistration();
    if (!Trigger || !registration) return false;
    if (args.targetMs <= Date.now()) return false;
    await registration.showNotification(args.title, {
      body: args.body,
      icon: "/icons/192",
      badge: "/icons/192",
      tag: completionTag(args.sessionId),
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: { action: "view", sessionId: args.sessionId },
      showTrigger: new Trigger(args.targetMs),
    } as NotificationOptions & { showTrigger: object; vibrate: number[] });
    return true;
  } catch {
    return false;
  }
}

/** Cancela el aviso programado (pausa, fin o desmonte). Best-effort. */
export async function cancelScheduledNotification(sessionId: string): Promise<void> {
  try {
    const registration = await getRegistration();
    if (!registration) return;
    const notes = await registration.getNotifications({ tag: completionTag(sessionId) });
    for (const note of notes) note.close();
  } catch {
    // Best-effort.
  }
}
