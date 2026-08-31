import { findActiveByUserId } from "@/repositories/focus-session.repository";
import { toSessionDTO } from "./session.dto";

export async function getActiveSessionForUser(userId: string) {
  const session = await findActiveByUserId(userId);
  if (!session) return null;
  return toSessionDTO(session);
}
