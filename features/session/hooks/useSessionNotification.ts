"use client";

import { useEffect, useRef } from "react";
import type { SessionDTO } from "@/services/session/session.dto";
import { playSoftCompletionSound, vibrateOnCompletion } from "@/features/session/session-sound";

/**
 * Fires the soft completion sound + vibration (where supported) and, only
 * if Notification permission was already granted (never prompted here), a
 * quiet system notification-once per session, the moment it transitions
 * to COMPLETED.
 */
export function useSessionCompletionEffects(session: SessionDTO | null) {
  const firedForId = useRef<string | null>(null);

  useEffect(() => {
    if (!session || session.status !== "COMPLETED") return;
    if (firedForId.current === session.id) return;
    firedForId.current = session.id;

    playSoftCompletionSound();
    vibrateOnCompletion();

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification("¡Excelente! Terminaste tu sesión.", {
          body: `${session.subcategoryName}-${session.plannedMinutes} minutos`,
          silent: true,
        });
      } catch {
        // Some contexts (e.g. no active service worker) can throw-ignore.
      }
    }
  }, [session]);
}
