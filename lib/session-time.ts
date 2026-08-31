/**
 * Pure timestamp math for the focus-session timer. Deliberately framework
 * and ORM free (plain ms-since-epoch numbers, not Date objects) so the same
 * formula can run identically on the server (source of truth) and the
 * client (display), and be unit tested without fake timers.
 */

export type SessionTimeInput = {
  startedAtMs: number;
  pausedMs: number;
  pausedAtMs: number | null;
  plannedMinutes: number;
};

export function isPaused(session: Pick<SessionTimeInput, "pausedAtMs">): boolean {
  return session.pausedAtMs !== null;
}

export function computeElapsedRunningMs(
  session: SessionTimeInput,
  nowMs: number,
): number {
  const referenceNow = session.pausedAtMs ?? nowMs;
  const rawElapsed = referenceNow - session.startedAtMs - session.pausedMs;
  return Math.max(0, rawElapsed);
}

export function computeRemainingMs(session: SessionTimeInput, nowMs: number): number {
  const plannedMs = session.plannedMinutes * 60_000;
  const elapsedMs = computeElapsedRunningMs(session, nowMs);
  return Math.max(0, plannedMs - elapsedMs);
}

export function computeActualMinutes(session: SessionTimeInput, nowMs: number): number {
  const elapsedMs = computeElapsedRunningMs(session, nowMs);
  return Math.floor(elapsedMs / 60_000);
}

/**
 * When extending a COMPLETED session we want the timer to show exactly the
 * requested extra minutes, regardless of how much wall-clock time has passed
 * since the session originally ended. This computes a new `startedAtMs` that
 * makes the effective elapsed time equal to the original planned duration,
 * leaving the extra minutes as remaining time.
 */
export function recalibrateStartForExtension(
  nowMs: number,
  originalPlannedMinutes: number,
  pausedMs: number,
): number {
  return nowMs - originalPlannedMinutes * 60_000 - pausedMs;
}
