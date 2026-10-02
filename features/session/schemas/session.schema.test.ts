import { describe, expect, it } from "vitest";
import { extendSessionSchema, sessionIdSchema, startSessionSchema } from "./session.schema";

describe("startSessionSchema (modo)", () => {
  it("CLASSIC por defecto sin config", () => {
    const parsed = startSessionSchema.safeParse({
      subcategoryId: "ckkkkkkkkkkkkkkkkkkkkkkk",
      plannedMinutes: 25,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.mode).toBe("CLASSIC");
  });

  it("POMODORO exige config", () => {
    const parsed = startSessionSchema.safeParse({
      subcategoryId: "ckkkkkkkkkkkkkkkkkkkkkkk",
      plannedMinutes: 25,
      mode: "POMODORO",
    });
    expect(parsed.success).toBe(false);
  });

  it("POMODORO con config válida pasa y rechaza rangos absurdos", () => {
    const base = {
      subcategoryId: "ckkkkkkkkkkkkkkkkkkkkkkk",
      plannedMinutes: 25,
      mode: "POMODORO" as const,
    };
    expect(
      startSessionSchema.safeParse({
        ...base,
        pomodoroConfig: { focusMin: 25, breakMin: 5, cycles: 2, autoStart: false },
      }).success,
    ).toBe(true);
    expect(
      startSessionSchema.safeParse({
        ...base,
        pomodoroConfig: { focusMin: 500, breakMin: 5, cycles: 2, autoStart: false },
      }).success,
    ).toBe(false);
  });

  it("schemas existentes intactos", () => {
    expect(sessionIdSchema.safeParse({ id: "no-cuid" }).success).toBe(false);
    expect(
      extendSessionSchema.safeParse({ id: "ckkkkkkkkkkkkkkkkkkkkkkk", extraMinutes: 10 }).success,
    ).toBe(true);
  });
});
