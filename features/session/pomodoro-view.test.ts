import { describe, expect, it } from "vitest";
import { derivePomodoroView, pomodoroPlannedMinutes, POMODORO_PRESETS } from "./pomodoro-view";

const MIN = 60_000;

describe("derivePomodoroView", () => {
  const config = { focusMin: 25, breakMin: 5, cycles: 2, autoStart: false };

  it("arranca en foco del ciclo 0", () => {
    const view = derivePomodoroView(0, config);
    expect(view.phase).toBe("focus");
    expect(view.cycleIndex).toBe(0);
    expect(view.phaseRemainingMs).toBe(25 * MIN);
    expect(view.focusDoneMs).toBe(0);
  });

  it("al completar el foco pasa a descanso sin descanso final tras el último", () => {
    const toBreak = derivePomodoroView(25 * MIN, config);
    expect(toBreak.phase).toBe("break");
    expect(toBreak.cycleIndex).toBe(0);
    const end = derivePomodoroView(25 * MIN + 5 * MIN + 25 * MIN, config);
    expect(end.phase).toBe("done");
    expect(end.cycleIndex).toBe(2);
    expect(end.focusDoneMs).toBe(50 * MIN);
  });

  it("segundo ciclo de foco tras el descanso", () => {
    const view = derivePomodoroView(25 * MIN + 5 * MIN + MIN, config);
    expect(view.phase).toBe("focus");
    expect(view.cycleIndex).toBe(1);
    expect(view.phaseElapsedMs).toBe(MIN);
  });

  it("extender alarga solo la última fase de foco", () => {
    const midFirst = derivePomodoroView(25 * MIN, config, 10 * MIN);
    expect(midFirst.phase).toBe("break");
    const endFocus = derivePomodoroView(25 * MIN + 5 * MIN + 25 * MIN, config, 10 * MIN);
    expect(endFocus.phase).toBe("focus");
    expect(endFocus.phaseRemainingMs).toBe(10 * MIN);
    expect(endFocus.totalFocusMs).toBe(60 * MIN);
  });

  it("tiempo negativo se fija a 0", () => {
    expect(derivePomodoroView(-5000, config).phaseElapsedMs).toBe(0);
  });

  it("config inválida lanza RangeError", () => {
    expect(() => derivePomodoroView(0, { ...config, cycles: 0 })).toThrow(RangeError);
    expect(() => derivePomodoroView(0, { ...config, focusMin: 0 })).toThrow(RangeError);
    expect(() => derivePomodoroView(0, config, -1)).toThrow(RangeError);
  });

  it("presets por energía con foco total 100/150/150 y autoStart manual", () => {    expect(POMODORO_PRESETS.baja).toMatchObject({ focusMin: 25, breakMin: 5, autoStart: false });
    expect(POMODORO_PRESETS.media).toMatchObject({ focusMin: 50, breakMin: 10 });
    expect(POMODORO_PRESETS.alta).toMatchObject({ focusMin: 75, breakMin: 15 });
    const total = (c: { focusMin: number; cycles: number }) => c.focusMin * c.cycles;
    expect(total(POMODORO_PRESETS.baja)).toBe(100);
    expect(total(POMODORO_PRESETS.media)).toBe(150);
    expect(total(POMODORO_PRESETS.alta)).toBe(150);
  });

  it("pomodoroPlannedMinutes suma foco + descansos intermedios", () => {
    expect(pomodoroPlannedMinutes({ focusMin: 25, breakMin: 5, cycles: 4, autoStart: false })).toBe(
      115,
    );
    expect(pomodoroPlannedMinutes({ focusMin: 50, breakMin: 10, cycles: 1, autoStart: true })).toBe(
      50,
    );
  });
});
