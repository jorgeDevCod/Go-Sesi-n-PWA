"use client";

import { useEffect, useRef } from "react";
import type { SessionDTO } from "@/services/session/session.dto";
import { vibrateOnCompletion } from "@/features/session/session-sound";

/**
 * Fires the completion vibration once per session the moment it transitions
 * to COMPLETED. The system notification with actions is handled by
 * useAppNotifications.
 */
export function useSessionCompletionEffects(session: SessionDTO | null) {
  const firedForId = useRef<string | null>(null);

  useEffect(() => {
    if (!session || session.status !== "COMPLETED") return;
    if (firedForId.current === session.id) return;
    firedForId.current = session.id;

    vibrateOnCompletion();
  }, [session]);
}
