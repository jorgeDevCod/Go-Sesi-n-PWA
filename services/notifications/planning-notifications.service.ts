import {
  listPendingPlanReminders,
  markPlanReminderSent,
} from "@/repositories/planning.repository";
import { sendPushToUser } from "@/services/push/push.service";
import { PLAN_TIME_ZONE } from "@/services/planning/daily-plan.service";
import { ROUTES } from "@/lib/routes";

type PlanningSummary = { sent: number; skipped: number; failures: number };

function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function localMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

function remindMinutes(remindAt: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(remindAt);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Envía recordatorios de actividades planificadas cuya hora local ya llegó.
 * Pensado para ejecutarse cada minuto desde cron-job.org.
 */
export async function processPlanningNotifications(
  now: Date = new Date(),
): Promise<PlanningSummary> {
  const summary: PlanningSummary = { sent: 0, skipped: 0, failures: 0 };
  const pending = await listPendingPlanReminders();

  for (const item of pending) {
    if (!item.remindAt) {
      summary.skipped += 1;
      continue;
    }
    const timeZone = item.plan.timeZone ?? PLAN_TIME_ZONE;
    // `plan.date` se guarda como medianoche UTC de la fecha local, no como
    // medianoche de la zona horaria. Comparar contra UTC evita que un plan de
    // Lima (UTC-5) se interprete como el día anterior.
    if (
      dateKeyInTimeZone(item.plan.date, "UTC") !==
      dateKeyInTimeZone(now, timeZone)
    ) {
      summary.skipped += 1;
      continue;
    }
    const due = remindMinutes(item.remindAt);
    if (due === null || localMinutes(now, timeZone) < due) {
      summary.skipped += 1;
      continue;
    }

    try {
      await sendPushToUser(item.plan.userId, {
        title: "Tu plan de hoy",
        body: `Es hora de: ${item.title}`,
        tag: `gosession-plan-${item.id}`,
        data: { url: ROUTES.home, type: "plan", itemId: item.id },
      });
      summary.sent += 1;
    } catch {
      summary.failures += 1;
    }

    // Se marca incluso sin suscripciones para no reintentar cada minuto.
    await markPlanReminderSent(item.id, now);
  }

  return summary;
}
