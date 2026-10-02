import { beforeEach, describe, expect, it } from "vitest";
import { getStoredPomodoroAutoStart, setStoredPomodoroAutoStart } from "./pomodoro-preference";

describe("pomodoro-preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("manual por defecto", () => {
    expect(getStoredPomodoroAutoStart()).toBe(false);
  });

  it("persiste la elección", () => {
    setStoredPomodoroAutoStart(true);
    expect(getStoredPomodoroAutoStart()).toBe(true);
    setStoredPomodoroAutoStart(false);
    expect(getStoredPomodoroAutoStart()).toBe(false);
  });
});
