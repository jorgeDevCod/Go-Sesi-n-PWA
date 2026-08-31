import { deleteSession, findById } from "@/repositories/focus-session.repository";
import { SessionForbiddenError, SessionNotFoundError } from "./session.errors";

export async function deleteSessionHistoryForUser(id: string, userId: string) {
  const session = await findById(id);
  if (!session) throw new SessionNotFoundError();
  if (session.userId !== userId) throw new SessionForbiddenError();

  await deleteSession(id);
}
