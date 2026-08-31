import { describe, expect, it } from "vitest";
import { deriveTimerView, formatRemaining } from "@/features/session/timer-view";
import type { SessionDTO } from "@/services/session/session.dto";

const T0 = new Date("2026-07-20T10:00:00.000Z").getTime();
const MIN = 60_000;

function makeSession(overrides: Partial<SessionDTO> = {}): SessionDTO {
  return {
    id: "session-1",
    status: "ACTIVE",
    startedAtMs: T0,
    endedAtMs: null,
    plannedMinutes: 25,
    actualMinutes: null,
    pausedMs: 0,
    pausedAtMs: null,
    extendedCount: 0,
    subcategoryId: "sub-1",
    subcategoryName: "React",
    subcategoryIcon: "Atom",
    subcategoryColor: "#06B6D4",
    categoryName: "Aprender",
    serverNowMs: T0,
    ...overrides,
  };
}

describe("deriveTimerView", () => {
  it("reports the full ratio and formatted time at the very start", () => {
    const view = deriveTimerView(makeSession(), T0);
    expect(view.remainingMs).toBe(25 * MIN);
    expect(view.progressRatio).toBe(1);
    expect(view.formattedTime).toBe("25:00");
    expect(view.isPaused).toBe(false);
    expect(view.hasReachedTarget).toBe(false);
  });

  it("counts down correctly mid-session", () => {
    const view = deriveTimerView(makeSession(), T0 + 10 * MIN);
    expect(view.remainingMs).toBe(15 * MIN);
    expect(view.progressRatio).toBe(15 / 25);
    expect(view.formattedTime).toBe("15:00");
  });

  it("reflects a paused state frozen at pausedAtMs", () => {
    const pausedAt = T0 + 5 * MIN;
    const view = deriveTimerView(
      makeSession({ pausedAtMs: pausedAt }),
      pausedAt + 999 * MIN,
    );
    expect(view.isPaused).toBe(true);
    expect(view.remainingMs).toBe(20 * MIN);
  });

  it("signals hasReachedTarget once remaining hits zero, clamped at zero", () => {
    const view = deriveTimerView(makeSession({ plannedMinutes: 10 }), T0 + 999 * MIN);
    expect(view.remainingMs).toBe(0);
    expect(view.progressRatio).toBe(0);
    expect(view.hasReachedTarget).toBe(true);
    expect(view.formattedTime).toBe("00:00");
  });

  it("formats hours when remaining is an hour or more", () => {
    const view = deriveTimerView(makeSession({ plannedMinutes: 90 }), T0);
    expect(view.formattedTime).toBe("1:30:00");
  });
});

describe("formatRemaining", () => {
  it("pads minutes and seconds", () => {
    expect(formatRemaining(65_000)).toBe("01:05");
  });

  it("floors partial seconds", () => {
    expect(formatRemaining(1_999)).toBe("00:01");
  });

  it("never goes negative", () => {
    expect(formatRemaining(-5000)).toBe("00:00");
  });
});
