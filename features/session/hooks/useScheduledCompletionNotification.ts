"use client";

import { useEffect, useRef } from "react";
import {
  cancelScheduledNotification,
  completionTargetMs,
  scheduleCompletionNotification,
} from "@/features/session/scheduled-notification";
import type { SessionDTO } from "@/services/session/session.dto";

/**
 * Mantiene programado el aviso de fin mientras la sesión está activa y
 * corriendo. Pausar/finalizar/extender/desmontar reprograma o cancela.
 * Sin soporte o sin permiso no hace nada.
 */
export function useScheduledCompletionNotification(session: SessionDTO | null) {
  const scheduledFor = useRef<string | null>(null);

  useEffect(() => {
    if (!session || session.status !== "ACTIVE") {
      if (scheduledFor.current) {
        const id = scheduledFor.current;
        scheduledFor.current = null;
        void cancelScheduledNotification(id);
      }
      return;
    }

    const target = completionTargetMs(
      {
        startedAtMs: session.startedAtMs,
        pausedMs: session.pausedMs,
        pausedAtMs: session.pausedAtMs,
        plannedMinutes: session.plannedMinutes,
      },
      Date.now(),
    );

    // Pausada o vencida: no hay hora futura que programar.
    if (target === null) {
      if (scheduledFor.current && scheduledFor.current !== session.id) {
        void cancelScheduledNotification(scheduledFor.current);
      }
      scheduledFor.current = null;
      return;
    }

    scheduledFor.current = session.id;
    void scheduleCompletionNotification({
      sessionId: session.id,
      title: session.subcategoryName,
      body: `Terminó tu sesión de ${session.subcategoryName}. ¡Revísala!`,
      targetMs: target,
    });

    return () => {
      // Se cancela al cambiar la sesión; el effect entrante reprograma.
      if (scheduledFor.current) {
        const id = scheduledFor.current;
        scheduledFor.current = null;
        void cancelScheduledNotification(id);
      }
    };
  }, [session]);
}
