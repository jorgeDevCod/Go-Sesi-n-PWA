"use client";

import { useEffect, useRef } from "react";
import type { SessionDTO } from "@/services/session/session.dto";

const ICON_URL = "/icons/512";

function canNotify(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  );
}

function formatElapsed(startedAtMs: number, pausedMs: number, nowMs: number): string {
  const elapsedMs = Math.max(0, nowMs - startedAtMs - pausedMs);
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  return `${minutes} min ${seconds} s`;
}

/**
 * Muestra notificaciones del sistema cuando una sesión termina y cuando la
 * app queda en segundo plano con una sesión activa. Cada notificación tiene
 * acciones:
 *  - Sesión terminada → "Abrir" (navega a la sesión).
 *  - Sesión activa (app cerrada) → "Finalizar sesión".
 */
export function useAppNotifications(session: SessionDTO | null) {
  const completedFiredRef = useRef<string | null>(null);
  const activeNotifiedForRef = useRef<string | null>(null);

  // Notificación al completar la sesión.
  useEffect(() => {
    if (!session || session.status !== "COMPLETED") return;
    if (completedFiredRef.current === session.id) return;
    completedFiredRef.current = session.id;
    if (!canNotify()) return;

    try {
      const options: NotificationOptions & { actions: { action: string; title: string }[] } = {
        body: `Finalizó tu sesión de: ${session.subcategoryName}`,
        icon: ICON_URL,
        badge: ICON_URL,
        data: { action: "view", sessionId: session.id },
        tag: `session-${session.id}`,
        requireInteraction: true,
        actions: [{ action: "view", title: "Ver sesión" }],
      };
      const notification = new Notification(session.subcategoryName, options);
      notification.onclick = () => {
        window.focus();
        window.location.href = "/app/session";
      };
    } catch {
      // Notification no disponible (p. ej. sin service worker).
    }
  }, [session]);

  // Notificación al cerrar/pausar la app con una sesión activa.
  useEffect(() => {
    if (!session || session.status !== "ACTIVE") return;
    const active = session;

    function notifyActive() {
      if (!canNotify()) return;
      if (activeNotifiedForRef.current === active.id) {
        // Solo notificamos una vez por sesión activa.
        return;
      }
      activeNotifiedForRef.current = active.id;
      const now = Date.now();
      const elapsed = formatElapsed(active.startedAtMs, active.pausedMs, now);

      try {
        const options: NotificationOptions & { actions: { action: string; title: string }[] } = {
          body: `Tu sesión va en ${elapsed}. ¿Quieres continuar o finalizarla?`,
          icon: ICON_URL,
          badge: ICON_URL,
          data: { action: "finish", sessionId: active.id },
          tag: `session-active-${active.id}`,
          requireInteraction: true,
          actions: [{ action: "finish", title: "Finalizar sesión" }],
        };
        const notification = new Notification(active.subcategoryName, options);
        notification.onclick = () => {
          window.focus();
          window.location.href = "/app/session";
        };
      } catch {
        // Ignorar.
      }
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") notifyActive();
    }
    function onPageHide() {
      notifyActive();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [session]);
}
