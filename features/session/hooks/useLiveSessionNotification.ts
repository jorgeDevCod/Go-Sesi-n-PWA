"use client";

import { useEffect, useRef } from "react";
import { isStandalonePwa } from "@/lib/pwa";
import { ROUTES } from "@/lib/routes";
import type { SessionDTO } from "@/services/session/session.dto";

function liveTag(sessionId: string): string {
  return `gosession-live-${sessionId}`;
}

function canNotify(): boolean {
  return (
    isStandalonePwa() &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted" &&
    "serviceWorker" in navigator
  );
}

/**
 * Notificación persistente alimentada por el mismo texto que pinta el
 * cronómetro. Al cambiar el segundo visible cambia la notificación, sin un
 * temporizador paralelo. Solo PWA instalada.
 */
export function useLiveSessionNotification({
  session,
  body,
  paused,
}: {
  session: SessionDTO | null;
  body: string | null;
  paused: boolean;
}) {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const sessionId = session?.id ?? null;
  const status = session?.status ?? null;
  const title = session?.subcategoryName ?? "Go Sesión";

  useEffect(() => {
    if (!sessionId || status !== "ACTIVE" || !canNotify()) return;

    let cancelled = false;
    void (async () => {
      try {
        registrationRef.current = await navigator.serviceWorker.ready;
      } catch {
        registrationRef.current = null;
      }
      if (cancelled) registrationRef.current = null;
    })();

    return () => {
      cancelled = true;
      registrationRef.current = null;
      void (async () => {
        try {
          const reg = await navigator.serviceWorker.ready;
          const notes = await reg.getNotifications({ tag: liveTag(sessionId) });
          for (const note of notes) note.close();
        } catch {
          // Best-effort.
        }
      })();
    };
  }, [sessionId, status]);

  useEffect(() => {
    if (!sessionId || status !== "ACTIVE" || !body || !canNotify()) return;

    let cancelled = false;
    void (async () => {
      try {
        const registration =
          registrationRef.current ?? (await navigator.serviceWorker.ready);
        registrationRef.current = registration;
        if (cancelled) return;

        await registration.showNotification(title, {
          body,
          icon: "/icons/192",
          badge: "/icons/192",
          tag: liveTag(sessionId),
          silent: true,
          renotify: false,
          requireInteraction: true,
          actions: [
            { action: "toggle", title: paused ? "Reanudar" : "Pausar" },
            { action: "finish", title: "Finalizar sesión" },
          ],
          data: { url: ROUTES.session, type: "live", sessionId },
        } as NotificationOptions & {
          renotify: boolean;
          silent: boolean;
          actions: { action: string; title: string }[];
        });
      } catch {
        // Best-effort.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [body, paused, sessionId, status, title]);
}
