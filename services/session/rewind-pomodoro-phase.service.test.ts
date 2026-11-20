import { beforeEach, describe, expect, it, vi } from "vitest";
import { rewindPomodoroPhaseForUser } from "./rewind-pomodoro-phase.service";
import { SessionNotRewindableError } from "./session.errors";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    findById: vi.fn(),
    updateSession: vi.fn(),
  },
}));

vi.mock("@/repositories/focus-session.repository", () => ({
  findById: mocks.findById,
  updateSession: mocks.updateSession,
}));

const MIN = 60_000;
const NOW = new Date("2026-11-20T12:00:00.000Z").getTime();
const CONFIG = { focusMin: 25, breakMin: 5, cycles: 2, autoStart: false };

function session(overrides: Record<string, unknown> = {}) {
  return {
    id: "sess-1",
    userId: "user-1",
    status: "ACTIVE",
    mode: "POMODORO",
    pomodoroConfig: CONFIG,
    startedAt: new Date(NOW - 31 * MIN),
    endedAt: null,
    plannedMinutes: 55,
    actualMinutes: null,
    pausedMs: 0,
    pausedAt: null,
    extendedCount: 0,
    extendedMinutes: 0,
    skippedFocusMs: 0,
    skippedBreakMs: 0,
    rewoundMs: 0,
    lastNotifiedPhaseKey: "focus:0:false",
    completionNotifiedAt: null,
    energyLevel: null,
    comment: null,
    activeUserId: "user-1",
    subcategoryId: "sub-1",
    subcategory: {
      id: "sub-1",
      name: "Inglés",
      icon: "Languages",
      color: "#38BDF8",
      category: { name: "Aprender" },
    },
    ...overrides,
  };
}

describe("rewindPomodoroPhaseForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(NOW);
  });

  it("retrocede del segundo foco al inicio del descanso anterior", async () => {
    const active = session();
    mocks.findById.mockResolvedValue(active);
    mocks.updateSession.mockImplementation((_id, patch) => ({
      ...active,
      ...patch,
    }));

    const result = await rewindPomodoroPhaseForUser("sess-1", "user-1");

    expect(mocks.updateSession).toHaveBeenCalledWith("sess-1", {
      rewoundMs: 6 * MIN,
      lastNotifiedPhaseKey: null,
    });
    expect(result.rewoundMs).toBe(6 * MIN);
  });

  it("no retrocede si ya está en el primer foco", async () => {
    const active = session({ startedAt: new Date(NOW - 5 * MIN) });
    mocks.findById.mockResolvedValue(active);

    await rewindPomodoroPhaseForUser("sess-1", "user-1");

    expect(mocks.updateSession).not.toHaveBeenCalled();
  });

  it("rechaza sesiones que no son Pomodoro", async () => {
    mocks.findById.mockResolvedValue(
      session({ mode: "CLASSIC", pomodoroConfig: null }),
    );

    await expect(
      rewindPomodoroPhaseForUser("sess-1", "user-1"),
    ).rejects.toBeInstanceOf(SessionNotRewindableError);
  });
});
