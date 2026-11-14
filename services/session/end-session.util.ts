import { computeActualMinutes } from "@/lib/session-time";
import type { SessionWithRelations } from "./session.dto";
import { parsePomodoroConfig } from "./session.dto";
import { derivePomodoroView } from "./pomodoro";
import { updateSession } from "@/repositories/focus-session.repository";

/**
 * En pomodoro `actualMinutes` cuenta solo enfoque (descansos excluidos).
 * Si el config está corrupto, cae al cálculo clásico en vez de fallar.
 */
export function computePomodoroFocusMinutes(
  session: Pick<
    SessionWithRelations,
    | "startedAt"
    | "pausedMs"
    | "pausedAt"
    | "pomodoroConfig"
    | "extendedMinutes"
    | "skippedFocusMs"
    | "skippedBreakMs"
  >,
  nowMs: number,
): number {
  const config = parsePomodoroConfig(session.pomodoroConfig);
  const referenceNow = session.pausedAt ? session.pausedAt.getTime() : nowMs;
  const elapsedMs = Math.max(0, referenceNow - session.startedAt.getTime() - session.pausedMs);
  if (!config) {
    return Math.floor(elapsedMs / 60_000);
  }
  const skippedFocusMs = session.skippedFocusMs ?? 0;
  const skippedBreakMs = session.skippedBreakMs ?? 0;
  const view = derivePomodoroView(
    elapsedMs + skippedFocusMs + skippedBreakMs,
    config,
    session.extendedMinutes * 60_000,
  );
  // El foco saltado no debe contar como tiempo real de enfoque.
  return Math.floor(Math.max(0, view.focusDoneMs - skippedFocusMs) / 60_000);
}

export function endSession(
  session: SessionWithRelations,
  status: "COMPLETED" | "INTERRUPTED",
  nowMs: number = Date.now(),
) {
  const actualMinutes =
    session.mode === "POMODORO"
      ? computePomodoroFocusMinutes(session, nowMs)
      : computeActualMinutes(
          {
            startedAtMs: session.startedAt.getTime(),
            pausedMs: session.pausedMs,
            pausedAtMs: session.pausedAt ? session.pausedAt.getTime() : null,
            plannedMinutes: session.plannedMinutes,
          },
          nowMs,
        );

  return updateSession(session.id, {
    status,
    endedAt: new Date(nowMs),
    actualMinutes,
    pausedAt: null,
    activeUserId: null,
  });
}
