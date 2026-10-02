import { dayStartUtcInTimeZone } from "@/lib/day";
import type { SessionHistoryEntry } from "@/services/session/history.dto";

export type WeeklyMinutes = { weekStartMs: number; label: string; minutes: number };
export type CategoryStat = { name: string; sessions: number; minutes: number };

export type SessionStats = {
  streakDays: number;
  totalSessions: number;
  completedCount: number;
  interruptedCount: number;
  totalMinutes: number;
  weeklyMinutes: WeeklyMinutes[];
  byCategory: CategoryStat[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TIME_ZONE = process.env.APP_TIMEZONE ?? "America/Lima";

function dayKey(ms: number, timeZone: string): string {
  return dayStartUtcInTimeZone(new Date(ms), timeZone).toISOString();
}

/** Lunes 00:00 (en la zona indicada) de la semana que contiene `ms`. */
function weekStartMs(ms: number, timeZone: string): number {
  const dayStart = dayStartUtcInTimeZone(new Date(ms), timeZone).getTime();
  // getUTCDay sobre el inicio-de-día Lima: 0=domingo..6=sábado.
  const weekday = new Date(dayStart).getUTCDay();
  const daysBack = (weekday + 6) % 7;
  return dayStart - daysBack * DAY_MS;
}

function weekLabel(ms: number): string {
  const text = new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "numeric",
    month: "short",
  }).format(new Date(ms));
  return `semana del ${text}`;
}

/**
 * Racha de días consecutivos con ≥1 sesión COMPLETED, terminando hoy o
 * ayer (si hoy aún no hay sesión, la racha sigue viva). Pura y testeable.
 */
export function computeStreakDays(
  entries: Pick<SessionHistoryEntry, "startedAtMs" | "status">[],
  nowMs: number = Date.now(),
  timeZone: string = DEFAULT_TIME_ZONE,
): number {
  const doneDays = new Set(
    entries.filter((e) => e.status === "COMPLETED").map((e) => dayKey(e.startedAtMs, timeZone)),
  );
  if (doneDays.size === 0) return 0;
  let cursor = dayStartUtcInTimeZone(new Date(nowMs), timeZone).getTime();
  if (!doneDays.has(new Date(cursor).toISOString())) cursor -= DAY_MS;
  let streak = 0;
  while (doneDays.has(new Date(cursor).toISOString())) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

/**
 * Deriva todas las estadísticas desde las entradas del historial ya
 * cargadas: no hace queries nuevas. `actualMinutes` ya excluye descansos
 * en pomodoro (viene del servidor).
 */
export function computeSessionStats(
  entries: SessionHistoryEntry[],
  nowMs: number = Date.now(),
  timeZone: string = DEFAULT_TIME_ZONE,
): SessionStats {
  const completedCount = entries.filter((e) => e.status === "COMPLETED").length;
  const totalMinutes = entries.reduce((sum, e) => sum + e.actualMinutes, 0);

  const byCategoryMap = new Map<string, CategoryStat>();
  for (const e of entries) {
    const current = byCategoryMap.get(e.categoryName) ?? {
      name: e.categoryName,
      sessions: 0,
      minutes: 0,
    };
    current.sessions += 1;
    current.minutes += e.actualMinutes;
    byCategoryMap.set(e.categoryName, current);
  }

  const weeksMap = new Map<number, number>();
  for (const e of entries) {
    const start = weekStartMs(e.startedAtMs, timeZone);
    weeksMap.set(start, (weeksMap.get(start) ?? 0) + e.actualMinutes);
  }
  const currentWeekStart = weekStartMs(nowMs, timeZone);
  const weeklyMinutes: WeeklyMinutes[] = Array.from({ length: 8 }, (_, i) => {
    const start = currentWeekStart - (7 - i) * 7 * DAY_MS;
    return { weekStartMs: start, label: weekLabel(start), minutes: weeksMap.get(start) ?? 0 };
  });

  return {
    streakDays: computeStreakDays(entries, nowMs, timeZone),
    totalSessions: entries.length,
    completedCount,
    interruptedCount: entries.length - completedCount,
    totalMinutes,
    weeklyMinutes,
    byCategory: [...byCategoryMap.values()].sort((a, b) => b.minutes - a.minutes),
  };
}
