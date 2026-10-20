import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PomodoroTimer } from "./PomodoroTimer";
import { useSessionStore } from "@/features/session/store/session.store";
import type { SessionDTO } from "@/services/session/session.dto";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    completeSessionAction: vi.fn(),
    playBreakWarning: vi.fn(() => vi.fn()),
    playFocusEndAlarm: vi.fn(() => vi.fn()),
    playSoftStartSound: vi.fn(),
  },
}));

vi.mock("@/features/session/actions/session.actions", () => ({
  completeSessionAction: mocks.completeSessionAction,
}));

vi.mock("@/features/session/session-sound", () => ({
  playBreakWarning: mocks.playBreakWarning,
  playFocusEndAlarm: mocks.playFocusEndAlarm,
  playSoftStartSound: mocks.playSoftStartSound,
}));

// AnimatePresence retiene el modal en exit-animation y los fake timers no la
// drenan: en este test se pasa en directo (el contenido aparece/desaparece
// con `open`, que es lo que se verifica).
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const MIN = 60_000;
const T0 = new Date("2026-10-01T10:00:00.000Z").getTime();

function makeSession(autoStart: boolean): SessionDTO {
  return {
    id: "sess-1",
    status: "ACTIVE",
    startedAtMs: T0,
    endedAtMs: null,
    plannedMinutes: 55,
    actualMinutes: null,
    pausedMs: 0,
    pausedAtMs: null,
    extendedCount: 0,
    extendedMinutes: 0,
    mode: "POMODORO",
    pomodoroConfig: {
      focusMin: 25,
      breakMin: 5,
      cycles: 2,
      autoStart,
      longBreakMin: 0,
      skipBreaks: false,
    },
    subcategoryId: "sub-1",
    subcategoryName: "React",
    subcategoryIcon: "Atom",
    subcategoryColor: "#06B6D4",
    categoryName: "Aprender",
    serverNowMs: T0,
  };
}

function renderTimer(autoStart: boolean) {
  useSessionStore.getState().setSession(makeSession(autoStart));
  const noop = vi.fn();
  render(
    <PomodoroTimer
      session={makeSession(autoStart)}
      isPending={false}
      onPause={noop}
      onResume={noop}
      onFinish={noop}
    />,
  );
}

describe("PomodoroTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    mocks.completeSessionAction.mockResolvedValue({
      success: true,
      session: { ...makeSession(false), status: "COMPLETED" },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    useSessionStore.getState().clearSession();
  });

  it("muestra Foco 1 de 2 al inicio y el contador de ciclos", () => {
    renderTimer(false);
    expect(screen.getByText("Foco 1 de 2")).toBeInTheDocument();
    expect(screen.getByText("Pomodoro 25/5 × 2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ciclo 1 de 2" })).toBeInTheDocument();
  });

  it("al terminar el foco suena la alarma de 8s", () => {
    renderTimer(true);
    act(() => {
      vi.advanceTimersByTime(25 * MIN);
    });
    expect(mocks.playFocusEndAlarm).toHaveBeenCalledWith(8);
  });

  it("pre-avisa 6s antes de terminar el descanso", () => {
    renderTimer(true);
    act(() => {
      vi.advanceTimersByTime(25 * MIN + 5 * MIN - 5_000);
    });
    expect(mocks.playBreakWarning).toHaveBeenCalled();
  });

  it("al terminar el descanso muestra ¡Iniciemos! y reinicia el foco", () => {
    renderTimer(true);
    act(() => {
      vi.advanceTimersByTime(25 * MIN + 5 * MIN);
    });
    expect(screen.getByText("¡Iniciemos!")).toBeInTheDocument();
    expect(mocks.playSoftStartSound).toHaveBeenCalled();
  });

  it("modo manual: avisa al terminar el foco", () => {
    renderTimer(false);
    act(() => {
      vi.advanceTimersByTime(25 * MIN);
    });
    expect(screen.getByRole("dialog", { name: "Foco completado" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.queryByRole("dialog", { name: "Foco completado" })).not.toBeInTheDocument();
  });

  it("modo automático: sin modal y completa al terminar los ciclos", async () => {
    renderTimer(true);
    await act(async () => {
      vi.advanceTimersByTime(25 * MIN + 5 * MIN + 25 * MIN);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mocks.completeSessionAction).toHaveBeenCalledWith({ id: "sess-1" });
  });
});
