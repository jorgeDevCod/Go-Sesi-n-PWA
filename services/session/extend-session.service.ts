import { Prisma } from "@/lib/generated/prisma/client";
import { recalibrateStartForExtension } from "@/lib/session-time";
import { findById, updateSession } from "@/repositories/focus-session.repository";
import {
  SessionForbiddenError,
  SessionNotExtendableError,
  SessionNotFoundError,
} from "./session.errors";
import { toSessionDTO } from "./session.dto";

export async function extendSessionForUser(
  id: string,
  userId: string,
  extraMinutes: number,
) {
  const session = await findById(id);
  if (!session) throw new SessionNotFoundError();
  if (session.userId !== userId) throw new SessionForbiddenError();

  if (session.status !== "COMPLETED" || session.pausedAt !== null) {
    throw new SessionNotExtendableError();
  }

  try {
    const nowMs = Date.now();
    // Al extender queremos que el temporizador muestre exactamente los
    // minutos extra solicitados, sin importar cuánto tiempo haya pasado
    // desde que la sesión original terminó. Recalibramos startedAt para
    // que el tiempo efectivamente transcurrido sea el plan original y el
    // restante sea el tiempo extra.
    const newStartedAtMs = recalibrateStartForExtension(
      nowMs,
      session.plannedMinutes,
      session.pausedMs,
    );

    const updated = await updateSession(id, {
      status: "ACTIVE",
      startedAt: new Date(newStartedAtMs),
      endedAt: null,
      actualMinutes: session.actualMinutes,
      plannedMinutes: session.plannedMinutes + extraMinutes,
      extendedCount: session.extendedCount + 1,
      extendedMinutes: session.extendedMinutes + extraMinutes,
      activeUserId: userId,
    });
    return toSessionDTO(updated, nowMs);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new SessionNotExtendableError();
    }
    throw error;
  }
}
