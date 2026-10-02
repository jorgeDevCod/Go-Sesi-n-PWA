import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InvalidPomodoroConfigError,
  startSessionForUser,
} from "./start-session.service";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    findActiveByUserId: vi.fn(),
    createSession: vi.fn(),
    findSubcategoryById: vi.fn(),
  },
}));

vi.mock("@/repositories/focus-session.repository", () => ({
  findActiveByUserId: mocks.findActiveByUserId,
  createSession: mocks.createSession,
}));

vi.mock("@/repositories/subcategory.repository", () => ({
  findSubcategoryById: mocks.findSubcategoryById,
}));

function subcategory(owner: string) {
  return { id: "sub-1", userId: owner };
}

function created(mode: string, pomodoroConfig: unknown) {
  return {
    id: "sess-1",
    status: "ACTIVE",
    mode,
    pomodoroConfig,
    startedAt: new Date(),
    endedAt: null,
    plannedMinutes: 25,
    actualMinutes: null,
    pausedMs: 0,
    pausedAt: null,
    extendedCount: 0,
    extendedMinutes: 0,
    subcategoryId: "sub-1",
    userId: "A",
    subcategory: { name: "Sub", icon: "Star", color: "#fff", category: { name: "Cat" } },
  };
}

describe("startSessionForUser (modo)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findActiveByUserId.mockResolvedValue(null);
    mocks.findSubcategoryById.mockResolvedValue(subcategory("A"));
  });

  it("CLASSIC por defecto guarda mode sin config", async () => {
    mocks.createSession.mockResolvedValue(created("CLASSIC", null));
    await startSessionForUser({ userId: "A", subcategoryId: "sub-1", plannedMinutes: 25 });
    expect(mocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "CLASSIC" }),
    );
    const arg = mocks.createSession.mock.calls[0][0];
    expect(arg.pomodoroConfig).toBeUndefined();
  });

  it("POMODORO sin config lanza error y no crea", async () => {
    await expect(
      startSessionForUser({ userId: "A", subcategoryId: "sub-1", plannedMinutes: 25, mode: "POMODORO" }),
    ).rejects.toBeInstanceOf(InvalidPomodoroConfigError);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("POMODORO con config válida la persiste", async () => {
    const config = { focusMin: 25, breakMin: 5, cycles: 2, autoStart: false };
    mocks.createSession.mockResolvedValue(created("POMODORO", config));
    const { session, reused } = await startSessionForUser({
      userId: "A",
      subcategoryId: "sub-1",
      plannedMinutes: 25,
      mode: "POMODORO",
      pomodoroConfig: config,
    });
    expect(reused).toBe(false);
    expect(mocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "POMODORO", pomodoroConfig: config }),
    );
    expect(session.mode).toBe("POMODORO");
    expect(session.pomodoroConfig).toEqual(config);
  });

  it("POMODORO con config fuera de rango lanza error", async () => {
    await expect(
      startSessionForUser({
        userId: "A",
        subcategoryId: "sub-1",
        plannedMinutes: 25,
        mode: "POMODORO",
        pomodoroConfig: { focusMin: 500, breakMin: 5, cycles: 2, autoStart: false },
      }),
    ).rejects.toBeInstanceOf(InvalidPomodoroConfigError);
  });

  it("sesión ACTIVE existente se reutiliza sin crear", async () => {
    mocks.findActiveByUserId.mockResolvedValue(created("CLASSIC", null));
    const { reused } = await startSessionForUser({
      userId: "A",
      subcategoryId: "sub-1",
      plannedMinutes: 25,
    });
    expect(reused).toBe(true);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
});
