import { findById } from "@/repositories/focus-session.repository";
import { SessionForbiddenError, SessionNotFoundError } from "./session.errors";
import { toSessionDTO } from "./session.dto";
import { endSession } from "./end-session.util";

export async function completeSessionForUser(id: string, userId: string) {
  const session = await findById(id);
  if (!session) throw new SessionNotFoundError();
  if (session.userId !== userId) throw new SessionForbiddenError();

  if (session.status !== "ACTIVE") {
    return toSessionDTO(session);
  }

  const updated = await endSession(session, "COMPLETED");
  return toSessionDTO(updated);
}
