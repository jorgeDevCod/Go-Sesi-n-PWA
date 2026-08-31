import { findById, updateSession } from "@/repositories/focus-session.repository";
import { SessionForbiddenError, SessionNotFoundError } from "./session.errors";
import { toSessionDTO } from "./session.dto";

export async function resumeSessionForUser(id: string, userId: string) {
  const session = await findById(id);
  if (!session) throw new SessionNotFoundError();
  if (session.userId !== userId) throw new SessionForbiddenError();

  if (session.status !== "ACTIVE" || session.pausedAt === null) {
    return toSessionDTO(session);
  }

  const pausedDurationMs = Date.now() - session.pausedAt.getTime();
  const updated = await updateSession(id, {
    pausedMs: session.pausedMs + pausedDurationMs,
    pausedAt: null,
  });
  return toSessionDTO(updated);
}
