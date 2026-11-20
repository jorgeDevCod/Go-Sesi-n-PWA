import { findById, updateSession } from "@/repositories/focus-session.repository";
import { derivePomodoroView, pomodoroAdjustedMs } from "./pomodoro";
import { parsePomodoroConfig, toSessionDTO } from "./session.dto";
import { endSession } from "./end-session.util";
import {
  SessionForbiddenError,
  SessionNotFoundError,
  SessionNotSkippableError,
} from "./session.errors";

/**
 * Avanza la fase pomodoro actual sin esperar a que termine.
 * El tiempo de foco saltado no cuenta como enfoque real; el descanso saltado
 * solo avanza la línea de tiempo.
 */
export async function skipPomodoroPhaseForUser(id: string, userId: string) {
  const session = await findById(id);
  if (!session) throw new SessionNotFoundError();
  if (session.userId !== userId) throw new SessionForbiddenError();
  if (session.status !== "ACTIVE") return toSessionDTO(session);
  if (session.mode !== "POMODORO") throw new SessionNotSkippableError();

  const config = parsePomodoroConfig(session.pomodoroConfig);
  if (!config) throw new SessionNotSkippableError();

  const nowMs = Date.now();
  const referenceNow = session.pausedAt ? session.pausedAt.getTime() : nowMs;
  const elapsedMs = Math.max(
    0,
    referenceNow - session.startedAt.getTime() - session.pausedMs,
  );
  const view = derivePomodoroView(
    elapsedMs + pomodoroAdjustedMs(session),
    config,
    session.extendedMinutes * 60_000,
  );

  if (view.phase === "done") {
    const completed = await endSession(session, "COMPLETED", nowMs);
    return toSessionDTO(completed, nowMs);
  }

  const skippedFocusMs =
    session.skippedFocusMs + (view.phase === "focus" ? view.phaseRemainingMs : 0);
  const skippedBreakMs =
    session.skippedBreakMs + (view.phase === "break" ? view.phaseRemainingMs : 0);

  const updated = await updateSession(session.id, {
    skippedFocusMs,
    skippedBreakMs,
  });

  const nextView = derivePomodoroView(
    elapsedMs + pomodoroAdjustedMs(updated),
    config,
    session.extendedMinutes * 60_000,
  );

  if (nextView.phase === "done") {
    const completed = await endSession(updated, "COMPLETED", nowMs);
    return toSessionDTO(completed, nowMs);
  }

  return toSessionDTO(updated, nowMs);
}
