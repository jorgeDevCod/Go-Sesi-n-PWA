import { describe, expect, it } from "vitest";
import {
  derivePomodoroView,
  describePomodoroPlan,
  pomodoroConfigFor,
  pomodoroKey,
  pomodoroPlannedMinutes,
  POMODORO_PRESETS,
} from "./pomodoro-view";

const MIN = 60_000;

describe("pomodoro core", () => {
  const config = {
    focusMin: 25,
    breakMin: 5,
    cycles: 2,
    autoStart: false,
    longBreakMin: 0,
    skipBreaks: false,
  };

  it("describePomodoroPlan explica el plan y el total", () => {
    expect(describePomodoroPlan(config)).toBe(
      "2 ciclos de 25 min · 1 descansos de 5 min — 55 min en total",
    );
    expect(describePomodoroPlan({ ...config, cycles: 1 })).toContain("1 ciclo de 25 min");
    expect(describePomodoroPlan({ ...config, skipBreaks: true })).toContain("sin descansos");
    expect(describePomodoroPlan({ ...config, longBreakMin: 15 })).toContain(
      "descanso largo de 15 min",
    );
  });

  it("pomodoroKey y pomodoroConfigFor usan la config guardada o el preset", () => {
    expect(pomodoroKey("baja", "LOW")).toBe("baja:LOW");
    expect(pomodoroConfigFor("media", "MEDIUM")).toEqual(POMODORO_PRESETS.media);
    const saved = { "media:MEDIUM": { ...config, focusMin: 30 } };
    expect(pomodoroConfigFor("media", "MEDIUM", saved).focusMin).toBe(30);
  });

  it("skipBreaks encadena los focos sin fases de descanso", () => {
    const view = derivePomodoroView(25 * MIN, { ...config, skipBreaks: true });
    expect(view.phase).toBe("focus");
    expect(view.cycleIndex).toBe(1);
    const done = derivePomodoroView(50 * MIN, { ...config, skipBreaks: true });
    expect(done.phase).toBe("done");
  });

  it("descanso largo final ocurre antes de done", () => {
    const withLong = { ...config, longBreakMin: 15 };
    const duringLong = derivePomodoroView(50 * MIN + 5 * MIN, withLong);
    expect(duringLong.phase).toBe("break");
    expect(duringLong.isLongBreak).toBe(true);
    expect(duringLong.phaseRemainingMs).toBe(15 * MIN);
    const done = derivePomodoroView(50 * MIN + 5 * MIN + 15 * MIN, withLong);
    expect(done.phase).toBe("done");
  });

  it("plannedMinutes cuenta descansos y descanso largo", () => {
    expect(pomodoroPlannedMinutes(config)).toBe(55);
    expect(pomodoroPlannedMinutes({ ...config, longBreakMin: 15 })).toBe(70);
    expect(pomodoroPlannedMinutes({ ...config, skipBreaks: true })).toBe(50);
  });

  it("config legacy (sin campos nuevos) sigue funcionando", () => {
    const legacy = { focusMin: 25, breakMin: 5, cycles: 2, autoStart: false };
    const view = derivePomodoroView(25 * MIN, legacy);
    expect(view.phase).toBe("break");
    expect(view.isLongBreak).toBe(false);
    expect(pomodoroPlannedMinutes(legacy)).toBe(55);
  });

  it("rechaza configuraciones inválidas", () => {
    expect(() => derivePomodoroView(0, { ...config, focusMin: 0 })).toThrow(RangeError);
    expect(() => derivePomodoroView(0, { ...config, cycles: 0 })).toThrow(RangeError);
    expect(() => derivePomodoroView(0, { ...config, longBreakMin: -1 })).toThrow(RangeError);
  });
});
