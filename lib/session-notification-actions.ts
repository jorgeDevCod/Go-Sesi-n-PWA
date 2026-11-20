export type SessionNotificationActionId = "finish" | "skip" | "previous";

export type SessionNotificationAction = {
  action: SessionNotificationActionId;
  title: string;
};

/**
 * Acciones permitidas en las notificaciones de una sesión.
 * El temporizador clásico solo permite finalizar; Pomodoro permite avanzar
 * o retroceder de fase, pero nunca pausar o reanudar.
 */
export function sessionNotificationActions({
  mode,
  phase,
}: {
  mode: "CLASSIC" | "POMODORO";
  phase?: "focus" | "break" | "done" | null;
}): SessionNotificationAction[] {
  if (mode === "POMODORO") {
    return [
      {
        action: "skip",
        title: phase === "break" ? "Saltar descanso" : "Saltar foco",
      },
      { action: "previous", title: "Retroceder fase" },
    ];
  }
  return [{ action: "finish", title: "Finalizar sesión" }];
}
