import { findById, updateSession } from "@/repositories/focus-session.repository";
import { SessionForbiddenError, SessionNotFoundError } from "./session.errors";
import { toSessionDTO } from "./session.dto";

export async function pauseSessionForUser(
  id: string,
  userId: string,
  pausedAtMs?: number,
) {
  const session = await findById(id);
  if (!session) throw new SessionNotFoundError();
  if (session.userId !== userId) throw new SessionForbiddenError();

  if (session.status !== "ACTIVE" || session.pausedAt !== null) {
    return toSessionDTO(session);
  }

  // El cliente envía el instante del clic; validamos para evitar fechas
  // futuras o valores arbitrarios y mantenemos el cálculo en servidor.
  const nowMs = Date.now();
  const requested =
    pausedAtMs &&
    pausedAtMs <= nowMs + 2_000 &&
    pausedAtMs >= nowMs - 60_000
      ? pausedAtMs
      : nowMs;
  const pausedAt = new Date(Math.max(session.startedAt.getTime(), requested));

  const updated = await updateSession(id, { pausedAt });
  return toSessionDTO(updated, nowMs);
}
