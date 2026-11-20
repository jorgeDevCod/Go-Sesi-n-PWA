import { findById, updateSession } from "@/repositories/focus-session.repository";
import {
  derivePomodoroView,
  pomodoroAdjustedMs,
  pomodoroPhaseWindows,
} from "./pomodoro";
import { parsePomodoroConfig, toSessionDTO } from "./session.dto";
import {
  SessionForbiddenError,
  SessionNotFoundError,
  SessionNotRewindableError,
} from "./session.errors";

/**
 * Retrocede al inicio de la fase Pomodoro anterior. El tiempo descontado se
 * acumula en `rewoundMs` para que la vista, el cron y las notificaciones
 * trabajen con la misma línea de tiempo.
 */
export async function rewindPomodoroPhaseForUser(id: string, userId: string) {
  const session = await findById(id);
  if (!session) throw new SessionNotFoundError();
  if (session.userId !== userId) throw new SessionForbiddenError();
  if (session.status !== "ACTIVE") return toSessionDTO(session);
  if (session.mode !== "POMODORO") throw new SessionNotRewindableError();

  const config = parsePomodoroConfig(session.pomodoroConfig);
  if (!config) throw new SessionNotRewindableError();

  const nowMs = Date.now();
  const referenceNow = session.pausedAt ? session.pausedAt.getTime() : nowMs;
  const elapsedMs = Math.max(
    0,
    referenceNow - session.startedAt.getTime() - session.pausedMs,
  );
  const adjustedElapsedMs = Math.max(0, elapsedMs + pomodoroAdjustedMs(session));
  const view = derivePomodoroView(
    adjustedElapsedMs,
    config,
    session.extendedMinutes * 60_000,
  );

  if (view.phase === "done") return toSessionDTO(session, nowMs);

  const windows = pomodoroPhaseWindows(
    config,
    session.extendedMinutes * 60_000,
  );
  const currentIndex = windows.findIndex(
    (window) =>
      window.phase === view.phase &&
      window.cycleIndex === view.cycleIndex &&
      window.isLongBreak === view.isLongBreak,
  );
  if (currentIndex <= 0) return toSessionDTO(session, nowMs);

  const targetStartMs = windows[currentIndex - 1].startMs;
  const rewindMs = Math.max(0, adjustedElapsedMs - targetStartMs);
  if (rewindMs === 0) return toSessionDTO(session, nowMs);

  const updated = await updateSession(session.id, {
    rewoundMs: session.rewoundMs + rewindMs,
    lastNotifiedPhaseKey: null,
  });

  return toSessionDTO(updated, nowMs);
}
