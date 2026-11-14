"use client";

import { useEffect } from "react";
import { formatRemaining } from "@/features/session/timer-view";
import {
  derivePomodoroView,
  pomodoroSkippedMs,
} from "@/services/session/pomodoro";
import { useSessionStore } from "@/features/session/store/session.store";
import { isStandalonePwa } from "@/lib/pwa";
import { ROUTES } from "@/lib/routes";
import type { SessionDTO } from "@/services/session/session.dto";

const UPDATE_MS = 15_000;

function liveTag(sessionId: string): string {
  return `gosession-live-${sessionId}`;
}

function canNotify(): boolean {
  return (
    isStandalonePwa() &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  );
}

function liveBody(session: SessionDTO, nowMs: number, skewMs: number): string {
  if (session.mode === "POMODORO" && session.pomodoroConfig) {
    const reference = session.pausedAtMs ?? nowMs + skewMs;
    const elapsed = Math.max(0, reference - session.startedAtMs - session.pausedMs);
    const view = derivePomodoroView(
      elapsed + pomodoroSkippedMs(session),
      session.pomodoroConfig,
      session.extendedMinutes * 60_000,
    );
    const phase =
      view.phase === "focus"
        ? `Foco ${Math.min(view.cycleIndex + 1, session.pomodoroConfig.cycles)}/${session.pomodoroConfig.cycles}`
        : view.isLongBreak
          ? "Descanso final"
          : "Descanso";
    return `${phase} · quedan ${formatRemaining(view.phaseRemainingMs)}`;
  }

  const reference = session.pausedAtMs ?? nowMs + skewMs;
  const remaining = Math.max(
    0,
    session.plannedMinutes * 60_000 -
      (reference - session.startedAtMs - session.pausedMs),
  );
  return `${session.pausedAtMs !== null ? "Pausada" : "En curso"} · quedan ${formatRemaining(remaining)}`;
}

/**
 * Notificación persistente (best-effort) con el tiempo restante.
 * Solo PWA instalada; se actualiza mientras el proceso de la app sigue vivo.
 */
export function useLiveSessionNotification(session: SessionDTO | null) {
  const skewMs = useSessionStore((s) => s.skewMs);

  useEffect(() => {
    if (!session || session.status !== "ACTIVE" || !canNotify()) return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let registration: ServiceWorkerRegistration | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function show() {
      if (cancelled || !session) return;
      try {
        registration ??= await navigator.serviceWorker.ready;
        if (cancelled) return;
        await registration.showNotification(session.subcategoryName, {
          body: liveBody(session, Date.now(), skewMs),
          icon: "/icons/192",
          badge: "/icons/192",
          tag: liveTag(session.id),
          silent: true,
          renotify: false,
          requireInteraction: false,
          data: { url: ROUTES.session, type: "live", sessionId: session.id },
        } as NotificationOptions & { renotify: boolean; silent: boolean });
      } catch {
        // Best-effort: sin soporte o permiso, no pasa nada.
      }
    }

    void show();
    interval = setInterval(() => void show(), UPDATE_MS);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      void (async () => {
        try {
          const reg = registration ?? (await navigator.serviceWorker.ready);
          const notes = await reg.getNotifications({ tag: liveTag(session.id) });
          for (const note of notes) note.close();
        } catch {
          // Best-effort.
        }
      })();
    };
  }, [session, skewMs]);
}
