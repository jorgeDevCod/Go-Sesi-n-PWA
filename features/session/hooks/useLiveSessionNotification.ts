"use client";

import { useEffect, useRef } from "react";
import { formatRemaining } from "@/features/session/timer-view";
import {
  derivePomodoroView,
  pomodoroSkippedMs,
} from "@/services/session/pomodoro";
import { useSessionStore } from "@/features/session/store/session.store";
import { isStandalonePwa } from "@/lib/pwa";
import { ROUTES } from "@/lib/routes";
import type { SessionDTO } from "@/services/session/session.dto";

const UPDATE_MS = 1_000;

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
    const warning =
      !session.pausedAtMs && view.phaseRemainingMs > 0 && view.phaseRemainingMs <= 15_000
        ? "⚠️ "
        : "";
    return `${warning}${phase} · quedan ${formatRemaining(view.phaseRemainingMs)}`;
  }

  const reference = session.pausedAtMs ?? nowMs + skewMs;
  const remaining = Math.max(
    0,
    session.plannedMinutes * 60_000 -
      (reference - session.startedAtMs - session.pausedMs),
  );
  const warning =
    !session.pausedAtMs && remaining > 0 && remaining <= 15_000 ? "⚠️ " : "";
  return `${warning}${session.pausedAtMs !== null ? "Pausada" : "En curso"} · quedan ${formatRemaining(remaining)}`;
}

/**
 * Notificación persistente (best-effort) con el tiempo restante.
 * Mantiene un único tag y se actualiza cada segundo mientras la app vive.
 * Solo PWA instalada.
 */
export function useLiveSessionNotification(session: SessionDTO | null) {
  const skewMs = useSessionStore((s) => s.skewMs);
  const sessionRef = useRef(session);
  const sessionId = session?.id ?? null;
  const status = session?.status ?? null;

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!sessionId || status !== "ACTIVE" || !canNotify()) return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let registration: ServiceWorkerRegistration | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function show() {
      const active = sessionRef.current;
      if (cancelled || !active || active.status !== "ACTIVE") return;
      try {
        registration ??= await navigator.serviceWorker.ready;
        if (cancelled) return;
        await registration.showNotification(active.subcategoryName, {
          body: liveBody(active, Date.now(), skewMs),
          icon: "/icons/192",
          badge: "/icons/192",
          tag: liveTag(active.id),
          silent: true,
          renotify: false,
          requireInteraction: true,
          actions: [
            {
              action: "toggle",
              title: active.pausedAtMs !== null ? "Reanudar" : "Pausar",
            },
            { action: "finish", title: "Finalizar sesión" },
          ],
          data: { url: ROUTES.session, type: "live", sessionId: active.id },
        } as NotificationOptions & {
          renotify: boolean;
          silent: boolean;
          actions: { action: string; title: string }[];
        });
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
          const notes = await reg.getNotifications({ tag: liveTag(sessionId) });
          for (const note of notes) note.close();
        } catch {
          // Best-effort.
        }
      })();
    };
  }, [sessionId, skewMs, status]);
}
