import { findById, updateSession } from "@/repositories/focus-session.repository";
import { SessionForbiddenError, SessionNotFoundError } from "./session.errors";
import { toSessionDTO } from "./session.dto";

export async function pauseSessionForUser(id: string, userId: string) {
  const session = await findById(id);
  if (!session) throw new SessionNotFoundError();
  if (session.userId !== userId) throw new SessionForbiddenError();

  if (session.status !== "ACTIVE" || session.pausedAt !== null) {
    return toSessionDTO(session);
  }

  const updated = await updateSession(id, { pausedAt: new Date() });
  return toSessionDTO(updated);
}
