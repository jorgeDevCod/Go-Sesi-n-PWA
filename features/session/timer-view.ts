import { computeRemainingMs, isPaused as computeIsPaused } from "@/lib/session-time";
import type { SessionDTO } from "@/services/session/session.dto";

export type TimerView = {
  remainingMs: number;
  isPaused: boolean;
  /** 1 = full time remaining, 0 = none left. Drives the progress ring fill. */
  progressRatio: number;
  formattedTime: string;
  hasReachedTarget: boolean;
  /** Whether the remaining time includes one or more hours. */
  hasHours: boolean;
  /** Pre-formatted parts for custom layouts (e.g. 2-line display). */
  hourPart: string;
  minutePart: string;
  secondPart: string;
};

/**
 * Pure derivation from a session DTO + "now" to everything the timer UI
 * needs to render. This is the "reducer del cronómetro" the spec calls for:
 * transitions (pause/resume/extend) are always server round-trips that
 * replace the DTO wholesale, so there is no local action state to reduce —
 * only a pure view derived fresh from timestamps on every tick.
 */
export function deriveTimerView(session: SessionDTO, nowMs: number): TimerView {
  const plannedMs = session.plannedMinutes * 60_000;
  const remainingMs = computeRemainingMs(
    {
      startedAtMs: session.startedAtMs,
      pausedMs: session.pausedMs,
      pausedAtMs: session.pausedAtMs,
      plannedMinutes: session.plannedMinutes,
    },
    nowMs,
  );

  const formattedTime = formatRemaining(remainingMs);
  const hasHours = formattedTime.split(":").length === 3;
  const [hourPart, minutePart, secondPart] = formattedTime.split(":");

  return {
    remainingMs,
    isPaused: computeIsPaused({ pausedAtMs: session.pausedAtMs }),
    progressRatio: plannedMs === 0 ? 0 : remainingMs / plannedMs,
    formattedTime,
    hasReachedTarget: remainingMs <= 0,
    hasHours: Boolean(hasHours),
    hourPart: hourPart ?? "00",
    minutePart: minutePart ?? "00",
    secondPart: secondPart ?? "00",
  };
}

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
