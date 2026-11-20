import { describe, expect, it } from "vitest";
import { sessionNotificationActions } from "./session-notification-actions";

describe("sessionNotificationActions", () => {
  it("en clásico solo permite finalizar la sesión", () => {
    expect(sessionNotificationActions({ mode: "CLASSIC" })).toEqual([
      { action: "finish", title: "Finalizar sesión" },
    ]);
  });

  it("en Pomodoro permite saltar y retroceder la fase actual", () => {
    expect(
      sessionNotificationActions({ mode: "POMODORO", phase: "focus" }),
    ).toEqual([
      { action: "skip", title: "Saltar foco" },
      { action: "previous", title: "Retroceder fase" },
    ]);
    expect(
      sessionNotificationActions({ mode: "POMODORO", phase: "break" }),
    ).toEqual([
      { action: "skip", title: "Saltar descanso" },
      { action: "previous", title: "Retroceder fase" },
    ]);
  });
});
