import { listSessionsForUser } from "@/repositories/focus-session.repository";
import { toSessionHistoryEntry } from "./history.dto";

export async function listSessionHistoryForUser(userId: string) {
  const sessions = await listSessionsForUser(userId);
  return sessions.map(toSessionHistoryEntry);
}
