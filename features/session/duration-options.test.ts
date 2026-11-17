import { describe, expect, it } from "vitest";
import {
  buildDurationOptions,
  durationProfileFor,
} from "./duration-options";

describe("duration-options", () => {
  it("genera la progresión normal de 30 y 40", () => {
    expect(
      buildDurationOptions({ selectedMinutes: 30, profile: "medium" }),
    ).toEqual([15, 30, 50, 70, 90]);
  });

  it("energía alta usa la progresión 15 + 15 + 30", () => {
    expect(
      buildDurationOptions({ selectedMinutes: 30, profile: "high" }),
    ).toEqual([15, 30, 45, 60, 90]);
    expect(
      buildDurationOptions({ selectedMinutes: 40, profile: "high" }),
    ).toEqual([20, 40, 60, 80, 120]);
  });

  it("perfil bajo respeta el máximo de 60 minutos", () => {
    const options = buildDurationOptions({ selectedMinutes: 30, profile: "low" });
    expect(options[0]).toBe(15);
    expect(Math.max(...options)).toBeLessThanOrEqual(60);
  });

  it("detecta perfil alto por energía o dificultad", () => {
    expect(durationProfileFor("alta", "LOW")).toBe("high");
    expect(durationProfileFor("media", "HIGH")).toBe("high");
    expect(durationProfileFor("media", "MEDIUM")).toBe("medium");
    expect(durationProfileFor("baja", "LOW")).toBe("low");
  });

  it("incluye el tiempo recomendado aunque quede fuera de la secuencia", () => {
    const options = buildDurationOptions({
      selectedMinutes: 15,
      profile: "high",
      recommendedMinutes: 75,
    });
    expect(options).toContain(75);
  });
});
