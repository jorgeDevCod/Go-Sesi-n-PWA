import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionStatsView } from "./SessionStatsView";
import { computeSessionStats } from "../session-stats";
import type { SessionHistoryEntry } from "@/services/session/history.dto";

function entry(overrides: Partial<SessionHistoryEntry> & { id: string }): SessionHistoryEntry {
  return {
    status: "COMPLETED",
    startedAtMs: new Date("2026-10-01T15:00:00.000Z").getTime(),
    endedAtMs: null,
    plannedMinutes: 25,
    actualMinutes: 25,
    extendedCount: 0,
    extendedMinutes: 0,
    leftoverMinutes: 0,
    subcategoryName: "Sub",
    subcategoryIcon: "Star",
    subcategoryColor: "#fff",
    categoryName: "Aprender",
    ...overrides,
  };
}

describe("SessionStatsView", () => {
  it("muestra racha, sesiones, minutos y porcentaje", () => {
    const stats = computeSessionStats(
      [
        entry({ id: "1", actualMinutes: 25 }),
        entry({ id: "2", status: "INTERRUPTED", actualMinutes: 10, categoryName: "Salud" }),
      ],
      new Date("2026-10-01T17:00:00.000Z").getTime(),
      "America/Lima",
    );
    render(<SessionStatsView stats={stats} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("día de racha")).toBeInTheDocument();
    expect(screen.getByText("35")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Minutos por semana")).toBeInTheDocument();
    expect(screen.getByText("Aprender")).toBeInTheDocument();
    expect(screen.getByText("Salud")).toBeInTheDocument();
  });
});
