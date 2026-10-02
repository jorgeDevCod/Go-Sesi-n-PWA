import { beforeEach, describe, expect, it, vi } from "vitest";
import { computePomodoroFocusMinutes, endSession } from "./end-session.util";

const { mocks } = vi.hoisted(() => ({
  mocks: { updateSession: vi.fn() },
}));

vi.mock("@/repositories/focus-session.repository", () => ({
  updateSession: mocks.updateSession,
}));

function session(overrides: Record<string, unknown> = {}) {
  const startedAt = new Date("2026-10-01T10:00:00.000Z");
  return {
    id: "sess-1",
    status: "ACTIVE",
    mode: "CLASSIC",
    pomodoroConfig: null,
    startedAt,
    endedAt: null,
    plannedMinutes: 60,
    actualMinutes: null,
    pausedMs: 0,
    pausedAt: null,
    extendedCount: 0,
    extendedMinutes: 0,
    subcategoryId: "sub-1",
    userId: "A",
    ...overrides,
  };
}

describe("endSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateSession.mockImplementation((id: string, data: unknown) =>
      Promise.resolve({ id, ...(data as object) }),
    );
  });

  it("CLASSIC mantiene cálculo clásico (incluye todo el tiempo activo)", async () => {
    const nowMs = new Date("2026-10-01T11:00:00.000Z").getTime();
    await endSession(session() as never, "COMPLETED", nowMs);
    expect(mocks.updateSession).toHaveBeenCalledWith(
      "sess-1",
      expect.objectContaining({ status: "COMPLETED", actualMinutes: 60 }),
    );
  });

  it("POMODORO excluye descansos de actualMinutes", async () => {
    const config = { focusMin: 25, breakMin: 5, cycles: 2, autoStart: false };
    // 60 min activos: 25 foco + 5 descanso + 25 foco + 5 (done) → foco real 50.
    const nowMs = new Date("2026-10-01T11:00:00.000Z").getTime();
    await endSession(
      session({ mode: "POMODORO", pomodoroConfig: config }) as never,
      "COMPLETED",
      nowMs,
    );
    expect(mocks.updateSession).toHaveBeenCalledWith(
      "sess-1",
      expect.objectContaining({ actualMinutes: 50 }),
    );
  });

  it("POMODORO con config corrupta cae al cálculo clásico", () => {
    const nowMs = new Date("2026-10-01T11:00:00.000Z").getTime();
    const minutes = computePomodoroFocusMinutes(
      session({ mode: "POMODORO", pomodoroConfig: { roto: true } }) as never,
      nowMs,
    );
    expect(minutes).toBe(60);
  });
});
