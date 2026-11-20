import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimerScreen } from "./TimerScreen";
import { deriveTimerView } from "@/features/session/timer-view";
import type { SessionDTO } from "@/services/session/session.dto";

const MIN = 60_000;
const T0 = new Date("2026-11-14T10:00:00.000Z").getTime();

function makeSession(): SessionDTO {
  return {
    id: "session-1",
    status: "ACTIVE",
    startedAtMs: T0,
    endedAtMs: null,
    plannedMinutes: 15,
    actualMinutes: null,
    pausedMs: 0,
    pausedAtMs: null,
    extendedCount: 0,
    extendedMinutes: 0,
    skippedFocusMs: 0,
    skippedBreakMs: 0,
    rewoundMs: 0,
    mode: "CLASSIC",
    pomodoroConfig: null,
    subcategoryId: "sub-1",
    subcategoryName: "Meditación",
    subcategoryIcon: "Atom",
    subcategoryColor: "#06B6D4",
    categoryName: "Salud",
    serverNowMs: T0,
  };
}

function renderAt(remainingMs: number) {
  const session = makeSession();
  const now = T0 + session.plannedMinutes * MIN - remainingMs;
  render(
    <TimerScreen
      session={session}
      view={deriveTimerView(session, now)}
      isPending={false}
      onPause={vi.fn()}
      onResume={vi.fn()}
      onFinish={vi.fn()}
    />,
  );
}

describe("TimerScreen", () => {
  it("marca el cronómetro en rojo en los últimos 15 segundos", () => {
    renderAt(15_000);
    expect(screen.getByText("00:15")).toHaveClass("text-red-500");
  });

  it("mantiene el color normal con más de 15 segundos", () => {
    renderAt(16_000);
    expect(screen.getByText("00:16")).not.toHaveClass("text-red-500");
  });
});
