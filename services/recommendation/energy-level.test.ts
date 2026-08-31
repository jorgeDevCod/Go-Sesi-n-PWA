import { describe, expect, it } from "vitest";
import {
  ENERGY_DURATION_OPTIONS,
  ENERGY_MAX_MINUTES,
  ENERGY_MAX_LABEL,
  ENERGY_RECOMMENDED_DURATION,
  ENERGY_COMPLEXITY_TARGETS,
  effectiveComplexityTargets,
  effectiveRecommendedDuration,
  effectiveEnergyMin,
  effectiveEnergyMax,
  effectiveDifficultyMin,
  effectiveDifficultyMax,
  effectiveDurationOptions,
  effectiveMaxLabel,
  formatMaxLabel,
  energyMaxMinutes,
  filterSubcategoriesByEnergy,
  preferredComplexity,
  suggestedMinutesFor,
  type EnergyOverrides,
} from "./energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

type Item = { id: string; complexity: Complexity };

const all: Item[] = [
  { id: "low", complexity: "LOW" },
  { id: "medium", complexity: "MEDIUM" },
  { id: "high", complexity: "HIGH" },
];

const overrides: EnergyOverrides = {
  energyDurations: { baja: 30 },
  energyComplexityTargets: { media: ["MEDIUM", "HIGH"] },
  difficultyDurations: { HIGH: 45 },
};

describe("duración por energía", () => {
  it("la opción más promedio está en las opciones de cada nivel", () => {
    for (const level of ["baja", "media", "alta"] as const) {
      expect(ENERGY_DURATION_OPTIONS[level]).toContain(ENERGY_RECOMMENDED_DURATION[level]);
    }
  });

  it("energía baja: máximo 40 min y opciones cortas", () => {
    expect(ENERGY_MAX_MINUTES.baja).toBe(40);
    expect(Math.max(...ENERGY_DURATION_OPTIONS.baja)).toBeLessThanOrEqual(40);
  });

  it("energía media: máximo 1 hora (60 min)", () => {
    expect(ENERGY_MAX_MINUTES.media).toBe(60);
    expect(Math.max(...ENERGY_DURATION_OPTIONS.media)).toBe(60);
  });

  it("energía alta: tiempos regulares a altos", () => {
    expect(ENERGY_MAX_MINUTES.alta).toBeGreaterThanOrEqual(60);
    expect(ENERGY_RECOMMENDED_DURATION.alta).toBe(75);
  });

  it("energyMaxMinutes devuelve el tope por nivel", () => {
    expect(energyMaxMinutes("baja")).toBe(40);
    expect(energyMaxMinutes("media")).toBe(60);
    expect(energyMaxMinutes("alta")).toBe(90);
  });

  it("las etiquetas de máximo son legibles", () => {
    expect(ENERGY_MAX_LABEL.media).toContain("1 hora");
    expect(ENERGY_MAX_LABEL.baja).toContain("40");
  });
});

describe("complejidad preferida por energía", () => {
  it("energía baja siempre propone tareas simples (LOW)", () => {
    expect(preferredComplexity("baja", 5)).toBe("LOW");
    expect(preferredComplexity("baja", 60)).toBe("LOW");
  });

  it("energía media propone lo normal/cotidiano (MEDIUM)", () => {
    expect(preferredComplexity("media", 10)).toBe("MEDIUM");
    expect(preferredComplexity("media", 60)).toBe("MEDIUM");
  });

  it("energía alta propone retos según el tiempo", () => {
    expect(preferredComplexity("alta", 20)).toBe("MEDIUM");
    expect(preferredComplexity("alta", 40)).toBe("HIGH");
  });
});

describe("filterSubcategoriesByEnergy", () => {
  it("energía baja elige solo tareas simples (LOW)", () => {
    const result = filterSubcategoriesByEnergy(all, "baja");
    expect(result.map((i) => i.id)).toEqual(["low"]);
  });

  it("energía media elige tareas normales y cotidianas (LOW + MEDIUM)", () => {
    const result = filterSubcategoriesByEnergy(all, "media");
    expect(result.map((i) => i.id).sort()).toEqual(["low", "medium"]);
  });

  it("energía alta elige tareas desafiantes (MEDIUM + HIGH)", () => {
    const result = filterSubcategoriesByEnergy(all, "alta");
    expect(result.map((i) => i.id).sort()).toEqual(["high", "medium"]);
  });

  it("cae a todas si el filtro queda vacío", () => {
    const onlyHigh: Item[] = [{ id: "high", complexity: "HIGH" }];
    const result = filterSubcategoriesByEnergy(onlyHigh, "baja");
    expect(result).toEqual(onlyHigh);
  });

  it("sin energía no filtra", () => {
    expect(filterSubcategoriesByEnergy(all, undefined)).toEqual(all);
  });

  it("los targets definidos son coherentes con las reglas", () => {
    expect(ENERGY_COMPLEXITY_TARGETS.baja).toEqual(["LOW"]);
    expect(ENERGY_COMPLEXITY_TARGETS.media).toContain("MEDIUM");
    expect(ENERGY_COMPLEXITY_TARGETS.media).not.toContain("HIGH");
    expect(ENERGY_COMPLEXITY_TARGETS.alta).not.toContain("LOW");
  });
});

describe("overrides personalizados", () => {
  it("effectiveRecommendedDuration usa el override por energía o la constante", () => {
    expect(effectiveRecommendedDuration("baja", overrides)).toBe(30);
    expect(effectiveRecommendedDuration("media", overrides)).toBe(
      ENERGY_RECOMMENDED_DURATION.media,
    );
    expect(effectiveRecommendedDuration("media", undefined)).toBe(
      ENERGY_RECOMMENDED_DURATION.media,
    );
  });

  it("effectiveComplexityTargets usa el override o la constante", () => {
    expect(effectiveComplexityTargets("media", overrides)).toEqual(["MEDIUM", "HIGH"]);
    expect(effectiveComplexityTargets("baja", overrides)).toEqual(["LOW"]);
    expect(effectiveComplexityTargets("alta", undefined)).toEqual(["MEDIUM", "HIGH"]);
  });

  it("suggestedMinutesFor prioriza dificultad → energía → constante y acota por máximo", () => {
    expect(suggestedMinutesFor("alta", "HIGH", overrides)).toBe(60);
    expect(suggestedMinutesFor("baja", "LOW", overrides)).toBe(30);
    expect(suggestedMinutesFor("media", "MEDIUM", undefined)).toBe(
      ENERGY_RECOMMENDED_DURATION.media,
    );
    expect(suggestedMinutesFor("baja", "MEDIUM", undefined)).toBeLessThanOrEqual(
      ENERGY_MAX_MINUTES.baja,
    );
  });

  it("filterSubcategoriesByEnergy respeta targets personalizados y el fallback", () => {
    expect(filterSubcategoriesByEnergy(all, "media", ["MEDIUM", "HIGH"])).toEqual([
      { id: "medium", complexity: "MEDIUM" },
      { id: "high", complexity: "HIGH" },
    ]);
    expect(filterSubcategoriesByEnergy(all, "baja", ["LOW"])).toEqual([
      { id: "low", complexity: "LOW" },
    ]);
  });
});

describe("límites personalizados (min/máx) por energía y dificultad", () => {
  const minMaxOverrides: EnergyOverrides = {
    energyDurations: { media: 30 },
    energyMinDurations: { media: 15 },
    energyMaxDurations: { media: 50 },
    difficultyDurations: { LOW: 40 },
    difficultyMinDurations: { LOW: 35 },
    difficultyMaxDurations: { LOW: 45 },
  };

  it("effectiveEnergyMin/Max usa el override o el default", () => {
    expect(effectiveEnergyMin("media", minMaxOverrides)).toBe(15);
    expect(effectiveEnergyMax("media", minMaxOverrides)).toBe(50);
    expect(effectiveEnergyMin("baja", undefined)).toBe(25);
    expect(effectiveEnergyMax("baja", undefined)).toBe(40);
  });

  it("effectiveDifficultyMin/Max usa el override o el default", () => {
    expect(effectiveDifficultyMin("LOW", minMaxOverrides)).toBe(35);
    expect(effectiveDifficultyMax("LOW", minMaxOverrides)).toBe(45);
    expect(effectiveDifficultyMin("HIGH", undefined)).toBe(60);
    expect(effectiveDifficultyMax("HIGH", undefined)).toBe(90);
  });

  it("effectiveDurationOptions respeta [min, max] e incluye rec/min/max ordenados", () => {
    const opts = effectiveDurationOptions("media", minMaxOverrides);
    expect(opts[0]).toBe(15);
    expect(opts[opts.length - 1]).toBe(50);
    expect(opts).toContain(30);
    expect([...opts].sort((a, b) => a - b)).toEqual(opts);
  });

  it("effectiveDurationOptions sin custom usa las opciones por defecto", () => {
    const opts = effectiveDurationOptions("baja", undefined);
    expect(opts).toEqual([...ENERGY_DURATION_OPTIONS.baja].sort((a, b) => a - b));
  });

  it("effectiveMaxLabel y formatMaxLabel formatean el máximo efectivo", () => {
    expect(effectiveMaxLabel("media", minMaxOverrides)).toBe("máx. 50 min");
    expect(effectiveMaxLabel("media", undefined)).toBe("máx. 1 hora");
    expect(formatMaxLabel(90)).toBe("máx. 1 h 30 min");
    expect(formatMaxLabel(40)).toBe("máx. 40 min");
  });

  it("suggestedMinutesFor acota por los límites de energía y dificultad", () => {
    expect(suggestedMinutesFor("media", "LOW", minMaxOverrides)).toBe(40);
    expect(suggestedMinutesFor("media", "MEDIUM", minMaxOverrides)).toBe(45);
  });

  it("suggestedMinutesFor sube al mínimo efectivo si el rec queda por debajo", () => {
    const lowEnergy: EnergyOverrides = {
      energyDurations: { media: 20 },
      energyMinDurations: { media: 30 },
    };
    expect(suggestedMinutesFor("media", "MEDIUM", lowEnergy)).toBe(45);
  });

  it("suggestedMinutesFor baja al máximo de dificultad si el rec lo supera", () => {
    const diffMax: EnergyOverrides = {
      energyDurations: { media: 55 },
      difficultyMaxDurations: { MEDIUM: 40 },
    };
    expect(suggestedMinutesFor("media", "MEDIUM", diffMax)).toBe(40);
  });
});
