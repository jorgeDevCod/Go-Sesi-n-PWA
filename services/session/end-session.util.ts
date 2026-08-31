import { computeActualMinutes } from "@/lib/session-time";
import type { SessionWithRelations } from "./session.dto";
import { updateSession } from "@/repositories/focus-session.repository";

export function endSession(
  session: SessionWithRelations,
  status: "COMPLETED" | "INTERRUPTED",
  nowMs: number = Date.now(),
) {
  const actualMinutes = computeActualMinutes(
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
