import { describe, expect, it } from "vitest";
import {
  POMODORO_TIER_BY_ENERGY,
  POMODORO_TIER_LABELS,
  POMODORO_TIERS,
  pomodoroPresetFor,
  resolvePomodoroConfigForStart,
  type PomodoroConfig,
} from "./pomodoro-view";

const base: PomodoroConfig = {
  focusMin: 25,
  breakMin: 5,
  cycles: 2,
  autoStart: false,
  longBreakMin: 0,
  skipBreaks: false,
};

describe("niveles pre-programados (ligero/medio/intenso)", () => {
  it("expone 3 niveles con etiqueta y energía asociada", () => {
    expect(POMODORO_TIERS).toEqual(["ligero", "medio", "intenso"]);
    expect(POMODORO_TIER_LABELS.medio).toBe("Medio");
    expect(POMODORO_TIER_BY_ENERGY.baja).toBe("ligero");
    expect(POMODORO_TIER_BY_ENERGY.alta).toBe("intenso");
  });

  it("usa el preset guardado del nivel o el por defecto", () => {
    expect(pomodoroPresetFor("ligero").focusMin).toBe(25);
    const saved = { ligero: { ...base, focusMin: 15, breakMin: 3, cycles: 5 } };
    expect(pomodoroPresetFor("ligero", saved).focusMin).toBe(15);
  });

  it("prioridad al iniciar: actividad > nivel > combo energía:dificultad", () => {
    const activity = { ...base, focusMin: 40 };
    const presets = { medio: { ...base, focusMin: 20 } };
    const combos = { "media:MEDIUM": { ...base, focusMin: 33 } };

    expect(
      resolvePomodoroConfigForStart({
        activityConfig: activity,
        energy: "media",
        presets,
        savedCombos: combos,
        complexity: "MEDIUM",
      }).focusMin,
    ).toBe(40);

    expect(
      resolvePomodoroConfigForStart({
        activityConfig: null,
        energy: "media",
        presets,
        savedCombos: combos,
        complexity: "MEDIUM",
      }).focusMin,
    ).toBe(20);

    expect(
      resolvePomodoroConfigForStart({
        activityConfig: null,
        energy: "media",
        presets: {},
        savedCombos: combos,
        complexity: "MEDIUM",
      }).focusMin,
    ).toBe(33);
  });
});