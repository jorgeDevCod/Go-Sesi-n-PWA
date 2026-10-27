import { describe, expect, it } from "vitest";
import {
  HOME_GREETINGS,
  RAINBOW_HOME_GREETING,
  encouragementLeadForToday,
  homeGreetingForToday,
  welcomeGreetingForToday,
} from "./daily-greetings";

describe("saludos diarios", () => {
  it("elige un saludo estable para el mismo día", () => {
    const first = homeGreetingForToday(false, "2026-10-27");
    const second = homeGreetingForToday(false, "2026-10-27");
    expect(first).toBe(second);
    expect(HOME_GREETINGS).toContain(first);
  });

  it("solo incluye el saludo arcoíris cuando se permite", () => {
    const dates = Array.from({ length: 365 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 0, 1 + index));
      return date.toISOString().slice(0, 10);
    });

    for (const dateKey of dates) {
      expect(homeGreetingForToday(false, dateKey)).not.toBe(RAINBOW_HOME_GREETING);
    }

    const withRainbow = new Set(dates.map((dateKey) => homeGreetingForToday(true, dateKey)));
    expect(withRainbow.has(RAINBOW_HOME_GREETING)).toBe(true);
  });

  it("usa el nombre real de la cuenta, sin nombres fijos", () => {
    const greeting = welcomeGreetingForToday("Pedro", "2026-10-27");
    expect(greeting).toContain("Pedro");
    expect(greeting).not.toContain("Jorge");
  });

  it("alterna el inicio del mensaje entre Ya has completado y Ya llevas", () => {
    expect(["Ya has completado", "Ya llevas"]).toContain(
      encouragementLeadForToday("2026-10-27"),
    );
  });
});
