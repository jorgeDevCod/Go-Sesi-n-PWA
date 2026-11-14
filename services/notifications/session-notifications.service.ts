import {
  listActiveSessions,
  listRecentTerminalSessions,
  updateSessionNotificationState,
} from "@/repositories/focus-session.repository";
import { completeSessionForUser } from "@/services/session/complete-session.service";
import { parsePomodoroConfig, toSessionDTO } from "@/services/session/session.dto";
import { isSessionExpired } from "@/services/session/session-expiry";
import { derivePomodoroView, pomodoroSkippedMs } from "@/services/session/pomodoro";
import { computeElapsedRunningMs, computeRemainingMs } from "@/lib/session-time";
import { formatRemaining } from "@/features/session/timer-view";
import { sendPushToUser, PushNotConfiguredError } from "@/services/push/push.service";
import { ROUTES } from "@/lib/routes";

type CronSummary = {
  active: number;
  completed: number;
  phaseNotified: number;
  liveNotified: number;
  pushFailures: number;
};

async function sendLive(
  userId: string,
  sessionId: string,
  title: string,
  body: string,
): Promise<boolean> {
  try {
    await sendPushToUser(userId, {
      title,
      body,
      tag: `gosession-live-${sessionId}`,
      silent: true,
      renotify: false,
      data: { url: ROUTES.session, type: "live", sessionId },
    });
    return true;
  } catch (error) {
    if (error instanceof PushNotConfiguredError) return false;
    return false;
  }
}

async function sendPhase(
  userId: string,
  sessionId: string,
  title: string,
  body: string,
): Promise<boolean> {
  try {
    await sendPushToUser(userId, {
      title,
      body,
      tag: `gosession-phase-${sessionId}`,
      requireInteraction: true,
      data: { url: ROUTES.session, type: "phase", sessionId },
    });
    return true;
  } catch {
    return false;
  }
}

async function sendCompletion(
  userId: string,
  sessionId: string,
  title: string,
  body: string,
): Promise<boolean> {
  try {
    await sendPushToUser(userId, {
      title,
      body,
      tag: `gosession-done-${sessionId}`,
      requireInteraction: true,
      data: { url: ROUTES.sessionFinished(sessionId), type: "complete", sessionId },
    });
    return true;
  } catch {
    return false;
  }
}

function completionCopy(input: {
  status: "COMPLETED" | "INTERRUPTED";
  subcategoryName: string;
  cyclesDone?: boolean;
}): { title: string; body: string } {
  if (input.status === "COMPLETED" && input.cyclesDone) {
    return {
      title: "¡Completaste todos tus ciclos! 🎉",
      body: `Excelente trabajo en ${input.subcategoryName}. Cada ciclo cuenta.`,
    };
  }
  if (input.status === "COMPLETED") {
    return {
      title: "¡Sesión completada!",
      body: `Terminaste ${input.subcategoryName}. Buen trabajo; tu constancia suma.`,
    };
  }
  return {
    title: "Sesión finalizada",
    body: `Cerraste ${input.subcategoryName}. El tiempo que avanzaste también cuenta.`,
  };
}

export async function processSessionNotifications(nowMs = Date.now()): Promise<CronSummary> {
  const summary: CronSummary = {
    active: 0,
    completed: 0,
    phaseNotified: 0,
    liveNotified: 0,
    pushFailures: 0,
  };

  const activeSessions = await listActiveSessions();
  summary.active = activeSessions.length;

  for (const session of activeSessions) {
    const dto = toSessionDTO(session, nowMs);

    if (isSessionExpired(dto, nowMs)) {
      try {
        const completed = await completeSessionForUser(session.id, session.userId);
        const copy = completionCopy({
          status: completed.status === "INTERRUPTED" ? "INTERRUPTED" : "COMPLETED",
          subcategoryName: session.subcategory.name,
          cyclesDone: session.mode === "POMODORO",
        });
        const sent = await sendCompletion(
          session.userId,
          session.id,
          copy.title,
          copy.body,
        );
        if (!sent) summary.pushFailures += 1;
        await updateSessionNotificationState(session.id, {
          completionNotifiedAt: new Date(nowMs),
          lastNotifiedPhaseKey: "done",
        });
        summary.completed += 1;
      } catch {
        summary.pushFailures += 1;
      }
      continue;
    }

    if (session.mode === "POMODORO" && session.pomodoroConfig) {
      const config = parsePomodoroConfig(session.pomodoroConfig);
      if (config) {
        const elapsed = computeElapsedRunningMs(
          {
            startedAtMs: session.startedAt.getTime(),
            pausedMs: session.pausedMs,
            pausedAtMs: session.pausedAt ? session.pausedAt.getTime() : null,
            plannedMinutes: session.plannedMinutes,
          },
          nowMs,
        );
        const view = derivePomodoroView(
          elapsed + pomodoroSkippedMs(session),
          config,
          session.extendedMinutes * 60_000,
        );
        const phaseKey = `${view.phase}:${view.cycleIndex}:${view.isLongBreak}`;

        if (view.phase === "done") {
          try {
            const completed = await completeSessionForUser(session.id, session.userId);
            const copy = completionCopy({
              status: completed.status === "INTERRUPTED" ? "INTERRUPTED" : "COMPLETED",
              subcategoryName: session.subcategory.name,
              cyclesDone: true,
            });
            const sent = await sendCompletion(
              session.userId,
              session.id,
              copy.title,
              copy.body,
            );
            if (!sent) summary.pushFailures += 1;
            await updateSessionNotificationState(session.id, {
              completionNotifiedAt: new Date(nowMs),
              lastNotifiedPhaseKey: "done",
            });
            summary.completed += 1;
          } catch {
            summary.pushFailures += 1;
          }
          continue;
        }

        if (session.lastNotifiedPhaseKey === null) {
          await updateSessionNotificationState(session.id, {
            lastNotifiedPhaseKey: phaseKey,
          });
        } else if (session.lastNotifiedPhaseKey !== phaseKey) {
          const copy =
            view.phase === "break"
              ? {
                  title: "Foco completado",
                  body: view.isLongBreak
                    ? "Empieza tu descanso final. Te lo ganaste."
                    : `Empieza tu descanso de ${config.breakMin} min.`,
                }
              : {
                  title: "Descanso terminado",
                  body: "Vuelve al enfoque. Un paso más cerca de tu meta.",
                };
          const sent = await sendPhase(
            session.userId,
            session.id,
            copy.title,
            copy.body,
          );
          if (sent) summary.phaseNotified += 1;
          else summary.pushFailures += 1;
          await updateSessionNotificationState(session.id, {
            lastNotifiedPhaseKey: phaseKey,
          });
        }

        const phaseLabel =
          view.phase === "focus"
            ? `Foco ${Math.min(view.cycleIndex + 1, config.cycles)}/${config.cycles}`
            : view.isLongBreak
              ? "Descanso final"
              : "Descanso";
        const live = await sendLive(
          session.userId,
          session.id,
          session.subcategory.name,
          `${phaseLabel} · quedan ${formatRemaining(view.phaseRemainingMs)}`,
        );
        if (live) summary.liveNotified += 1;
      }
      continue;
    }

    const remaining = computeRemainingMs(
      {
        startedAtMs: session.startedAt.getTime(),
        pausedMs: session.pausedMs,
        pausedAtMs: session.pausedAt ? session.pausedAt.getTime() : null,
        plannedMinutes: session.plannedMinutes,
      },
      nowMs,
    );
    const live = await sendLive(
      session.userId,
      session.id,
      session.subcategory.name,
      `${session.pausedAt ? "Pausada" : "En curso"} · quedan ${formatRemaining(remaining)}`,
    );
    if (live) summary.liveNotified += 1;
  }

  // Sesiones cerradas por el cliente que aún no generaron push.
  const recent = await listRecentTerminalSessions(
    new Date(nowMs - 15 * 60_000),
  );
  for (const session of recent) {
    const copy = completionCopy({
      status: session.status === "INTERRUPTED" ? "INTERRUPTED" : "COMPLETED",
      subcategoryName: session.subcategory.name,
      cyclesDone: session.mode === "POMODORO",
    });
    const sent = await sendCompletion(session.userId, session.id, copy.title, copy.body);
    if (sent) summary.completed += 1;
    else summary.pushFailures += 1;
    await updateSessionNotificationState(session.id, {
      completionNotifiedAt: new Date(nowMs),
    });
  }

  return summary;
}
