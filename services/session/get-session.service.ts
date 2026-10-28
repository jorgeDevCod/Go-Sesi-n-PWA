import { findById } from "@/repositories/focus-session.repository";
import { toSessionDTO } from "./session.dto";

export async function getSessionForUser(id: string, userId: string) {
  const session = await findById(id);
  if (!session || session.userId !== userId) return null;
  return toSessionDTO(session);
}
