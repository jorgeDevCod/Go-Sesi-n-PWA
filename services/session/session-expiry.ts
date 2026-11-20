import { computeElapsedRunningMs, computeRemainingMs } from "@/lib/session-time";
import { derivePomodoroView, pomodoroAdjustedMs } from "./pomodoro";
import type { SessionDTO } from "./session.dto";

/**
 * Una sesión ACTIVE está vencida cuando ya cumplió su tiempo y no está pausada.
 * En Pomodoro se considera vencida al llegar a la fase "done".
 */
export function isSessionExpired(session: SessionDTO, nowMs: number = Date.now()): boolean {
  if (session.status !== "ACTIVE") return false;
  if (session.pausedAtMs !== null) return false;

  if (session.mode === "POMODORO" && session.pomodoroConfig) {
    const elapsed = computeElapsedRunningMs(
      {
        startedAtMs: session.startedAtMs,
        pausedMs: session.pausedMs,
        pausedAtMs: session.pausedAtMs,
        plannedMinutes: session.plannedMinutes,
      },
      nowMs,
    );
    const view = derivePomodoroView(
      elapsed + pomodoroAdjustedMs(session),
      session.pomodoroConfig,
      session.extendedMinutes * 60_000,
    );
    return view.phase === "done";
  }

  return (
    computeRemainingMs(
      {
        startedAtMs: session.startedAtMs,
        pausedMs: session.pausedMs,
        pausedAtMs: session.pausedAtMs,
        plannedMinutes: session.plannedMinutes,
      },
      nowMs,
    ) <= 0
  );
}
