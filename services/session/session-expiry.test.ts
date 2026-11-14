import { describe, expect, it } from "vitest";
import { isSessionExpired } from "./session-expiry";
import type { SessionDTO } from "./session.dto";

const MIN = 60_000;
const T0 = new Date("2026-11-14T10:00:00.000Z").getTime();

function makeSession(overrides: Partial<SessionDTO> = {}): SessionDTO {
  return {
    id: "sess-1",
    status: "ACTIVE",
    startedAtMs: T0,
    endedAtMs: null,
    plannedMinutes: 25,
    actualMinutes: null,
    pausedMs: 0,
    pausedAtMs: null,
    extendedCount: 0,
    extendedMinutes: 0,
    skippedFocusMs: 0,
    skippedBreakMs: 0,
    mode: "CLASSIC",
    pomodoroConfig: null,
    subcategoryId: "sub-1",
    subcategoryName: "React",
    subcategoryIcon: "Atom",
    subcategoryColor: "#06B6D4",
    categoryName: "Aprender",
    serverNowMs: T0,
    ...overrides,
  };
}

describe("isSessionExpired", () => {
  it("clásica: vence al llegar al tiempo planificado", () => {
    expect(isSessionExpired(makeSession(), T0 + 24 * MIN)).toBe(false);
    expect(isSessionExpired(makeSession(), T0 + 25 * MIN)).toBe(true);
  });

  it("pausada no se considera vencida", () => {
    expect(isSessionExpired(makeSession({ pausedAtMs: T0 + MIN }), T0 + 60 * MIN)).toBe(false);
  });

  it("pomodoro: vence al terminar todos los ciclos", () => {
    const session = makeSession({
      plannedMinutes: 55,
      mode: "POMODORO",
      pomodoroConfig: {
        focusMin: 25,
        breakMin: 5,
        cycles: 2,
        autoStart: true,
        longBreakMin: 0,
        skipBreaks: false,
      },
    });
    expect(isSessionExpired(session, T0 + 54 * MIN)).toBe(false);
    expect(isSessionExpired(session, T0 + 55 * MIN)).toBe(true);
  });
});
