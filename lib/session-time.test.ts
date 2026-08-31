import { describe, expect, it } from "vitest";
import {
  computeActualMinutes,
  computeElapsedRunningMs,
  computeRemainingMs,
  isPaused,
  recalibrateStartForExtension,
} from "@/lib/session-time";

const T0 = new Date("2026-07-20T10:00:00.000Z").getTime();
const MIN = 60_000;

describe("isPaused", () => {
  it("is false when pausedAtMs is null", () => {
    expect(isPaused({ pausedAtMs: null })).toBe(false);
  });

  it("is true when pausedAtMs is set", () => {
    expect(isPaused({ pausedAtMs: T0 })).toBe(true);
  });
});

describe("computeElapsedRunningMs", () => {
  it("counts straight elapsed time while running with no pauses", () => {
    const session = { startedAtMs: T0, pausedMs: 0, pausedAtMs: null, plannedMinutes: 30 };
    expect(computeElapsedRunningMs(session, T0 + 5 * MIN)).toBe(5 * MIN);
  });

  it("subtracts accumulated paused time while running", () => {
    const session = { startedAtMs: T0, pausedMs: 2 * MIN, pausedAtMs: null, plannedMinutes: 30 };
    expect(computeElapsedRunningMs(session, T0 + 10 * MIN)).toBe(8 * MIN);
  });

  it("freezes at pausedAtMs while currently paused, regardless of how long the pause lasts", () => {
    const pausedAt = T0 + 5 * MIN;
    const session = { startedAtMs: T0, pausedMs: 0, pausedAtMs: pausedAt, plannedMinutes: 30 };
    // A "long pause" (e.g. a week later) must not change the frozen elapsed value.
    expect(computeElapsedRunningMs(session, pausedAt + 1000)).toBe(5 * MIN);
    expect(computeElapsedRunningMs(session, pausedAt + 7 * 24 * 60 * MIN)).toBe(5 * MIN);
  });

  it("never goes negative even with clock skew making now look earlier than start", () => {
    const session = { startedAtMs: T0, pausedMs: 0, pausedAtMs: null, plannedMinutes: 30 };
    expect(computeElapsedRunningMs(session, T0 - 1000)).toBe(0);
  });
});

describe("computeRemainingMs", () => {
  it("counts down from plannedMinutes", () => {
    const session = { startedAtMs: T0, pausedMs: 0, pausedAtMs: null, plannedMinutes: 25 };
    expect(computeRemainingMs(session, T0 + 10 * MIN)).toBe(15 * MIN);
  });

  it("clamps at 0 once the planned time has elapsed", () => {
    const session = { startedAtMs: T0, pausedMs: 0, pausedAtMs: null, plannedMinutes: 10 };
    expect(computeRemainingMs(session, T0 + 999 * MIN)).toBe(0);
  });

  it("reload mid-session: reconstructing from stored timestamps reproduces the same remaining time", () => {
    // Simulates: session started, paused once for 3 min, resumed, then the
    // page was reloaded and remaining is recomputed purely from stored data.
    const startedAtMs = T0;
    const pausedMs = 3 * MIN;
    const session = { startedAtMs, pausedMs, pausedAtMs: null, plannedMinutes: 20 };
    const reloadNow = T0 + 12 * MIN; // 12 min of wall-clock since start
    // elapsed running = 12 - 3 = 9 min; remaining = 20 - 9 = 11 min
    expect(computeRemainingMs(session, reloadNow)).toBe(11 * MIN);
  });
});

describe("computeActualMinutes", () => {
  it("floors partial minutes", () => {
    const session = { startedAtMs: T0, pausedMs: 0, pausedAtMs: null, plannedMinutes: 30 };
    expect(computeActualMinutes(session, T0 + 5 * MIN + 59_000)).toBe(5);
  });

  it("excludes paused duration from actual minutes", () => {
    const session = { startedAtMs: T0, pausedMs: 10 * MIN, pausedAtMs: null, plannedMinutes: 30 };
    expect(computeActualMinutes(session, T0 + 20 * MIN)).toBe(10);
  });
});

describe("recalibrateStartForExtension", () => {
  it("makes the remaining time equal to the requested extra minutes", () => {
    // Session originally planned 25 min and ended at T0 + 25 min. User waits
    // 10 min, then extends by 10 min at T0 + 35 min.
    const extendNow = T0 + 35 * MIN;
    const newStartedAtMs = recalibrateStartForExtension(extendNow, 25, 0);

    const extendedSession = {
      startedAtMs: newStartedAtMs,
      pausedMs: 0,
      pausedAtMs: null,
      plannedMinutes: 35,
    };

    expect(computeRemainingMs(extendedSession, extendNow)).toBe(10 * MIN);
  });

  it("accounts for accumulated paused time from the original session", () => {
    const extendNow = T0 + 40 * MIN;
    const pausedMs = 5 * MIN;
    const newStartedAtMs = recalibrateStartForExtension(extendNow, 25, pausedMs);

    const extendedSession = {
      startedAtMs: newStartedAtMs,
      pausedMs,
      pausedAtMs: null,
      plannedMinutes: 35,
    };

    expect(computeRemainingMs(extendedSession, extendNow)).toBe(10 * MIN);
  });
});
