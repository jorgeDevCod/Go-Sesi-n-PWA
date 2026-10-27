import { beforeEach, describe, expect, it } from "vitest";
import {
  clearActivityTimerPreferences,
  getActivityTimerPreference,
  setActivityTimerPreference,
} from "./activity-timer-preference";

describe("activity timer preference (local)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("guarda y recupera el último ajuste por actividad", () => {
    setActivityTimerPreference("sub-1", { mode: "CLASSIC", classicMinutes: 45 });
    expect(getActivityTimerPreference("sub-1")).toEqual({
      mode: "CLASSIC",
      classicMinutes: 45,
    });
  });

  it("guarda Pomodoro y no mezcla actividades", () => {
    setActivityTimerPreference("sub-1", {
      mode: "POMODORO",
      pomodoroConfig: { focusMin: 50, breakMin: 10, cycles: 3, autoStart: false },
    });
    setActivityTimerPreference("sub-2", { mode: "CLASSIC", classicMinutes: 25 });
    expect(getActivityTimerPreference("sub-1")?.mode).toBe("POMODORO");
    expect(getActivityTimerPreference("sub-2")?.classicMinutes).toBe(25);
  });

  it("devuelve null si no existe y se puede limpiar", () => {
    expect(getActivityTimerPreference("sub-x")).toBeNull();
    setActivityTimerPreference("sub-x", { mode: "CLASSIC", classicMinutes: 30 });
    clearActivityTimerPreferences();
    expect(getActivityTimerPreference("sub-x")).toBeNull();
  });
});
