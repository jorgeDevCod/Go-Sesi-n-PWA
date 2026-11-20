"use client";

import { useEffect, useState } from "react";
import { InfoModal } from "@/components/ui/InfoModal";
import { playSessionSound } from "@/features/session/sound-manager";
import { getTodayPlanAction } from "@/features/planning/actions/planning.actions";
import { todayKey } from "@/lib/day";

type ActiveReminder = {
  id: string;
  title: string;
};

/**
 * Vigila los recordatorios del plan en toda la app abierta. El cron se encarga
 * del push cuando la PWA está cerrada; esto garantiza la alerta in-app aunque
 * el usuario esté en otra sección distinta del Home.
 */
export function PlanReminderWatcher() {
  const [reminder, setReminder] = useState<ActiveReminder | null>(null);

  useEffect(() => {
    let cancelled = false;
    let checking = false;

    async function checkReminders() {
      if (checking) return;
      checking = true;
      try {
        const result = await getTodayPlanAction();
        if (cancelled || !result.success || !result.plan) return;

        const now = new Date();
        const minutesNow = now.getHours() * 60 + now.getMinutes();
        for (const item of result.plan.items) {
          if (!item.remindAt || item.practiced) continue;
          const [hour, minute] = item.remindAt.split(":").map(Number);
          if (!Number.isFinite(hour) || !Number.isFinite(minute)) continue;
          if (minutesNow < hour * 60 + minute) continue;

          const key = `gosession-plan-reminded-${todayKey(now)}-${item.id}`;
          try {
            if (window.localStorage.getItem(key) === "1") continue;
            window.localStorage.setItem(key, "1");
          } catch {
            // Storage unavailable.
          }

          if (cancelled) return;
          playSessionSound("planning-reminder");
          setReminder({ id: item.id, title: item.title });
          break;
        }
      } finally {
        checking = false;
      }
    }

    const initial = window.setTimeout(() => void checkReminders(), 1200);
    const interval = window.setInterval(() => void checkReminders(), 30_000);
    function onVisibilityChange() {
      if (document.visibilityState === "visible") void checkReminders();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <InfoModal
      open={reminder !== null}
      onClose={() => setReminder(null)}
      title="Es hora de tu actividad"
      message={
        reminder
          ? `Tu plan de hoy incluye "${reminder.title}". Cuando quieras, empieza tu sesión.`
          : ""
      }
      confirmLabel="Entendido"
    />
  );
}
