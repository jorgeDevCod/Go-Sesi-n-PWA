import { describe, expect, it } from "vitest";
import { computeSessionStats, computeStreakDays } from "./session-stats";
import type { SessionHistoryEntry } from "@/services/session/history.dto";

const TZ = "America/Lima";

function entry(overrides: Partial<SessionHistoryEntry> & { startedAtMs: number }): SessionHistoryEntry {
  return {
    id: `${overrides.startedAtMs}-${overrides.status}`,
    status: "COMPLETED",
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

// 2026-10-01 12:00 Lima = 17:00 UTC.
const NOW = new Date("2026-10-01T17:00:00.000Z").getTime();
const day = (iso: string) => new Date(iso).getTime();

describe("computeStreakDays", () => {
  it("0 sin sesiones", () => {
    expect(computeStreakDays([], NOW, TZ)).toBe(0);
  });

  it("cuenta días consecutivos terminando hoy", () => {
    const entries = [
      entry({ startedAtMs: day("2026-10-01T15:00:00Z"), status: "COMPLETED" }),
      entry({ startedAtMs: day("2026-09-30T15:00:00Z"), status: "COMPLETED" }),
      entry({ startedAtMs: day("2026-09-29T15:00:00Z"), status: "COMPLETED" }),
    ];
    expect(computeStreakDays(entries, NOW, TZ)).toBe(3);
  });

  it("racha viva si hoy aún no hay sesión (empieza ayer)", () => {
    const entries = [entry({ startedAtMs: day("2026-09-30T15:00:00Z"), status: "COMPLETED" })];
    expect(computeStreakDays(entries, NOW, TZ)).toBe(1);
  });

  it("el hueco corta la racha e interrumpidas no cuentan", () => {
    const entries = [
      entry({ startedAtMs: day("2026-10-01T15:00:00Z"), status: "COMPLETED" }),
      entry({ startedAtMs: day("2026-09-30T15:00:00Z"), status: "INTERRUPTED" }),
      entry({ startedAtMs: day("2026-09-29T15:00:00Z"), status: "COMPLETED" }),
    ];
    expect(computeStreakDays(entries, NOW, TZ)).toBe(1);
  });
});

describe("computeSessionStats", () => {
  it("agrega totales, categorías y semanas", () => {
    const entries = [
      entry({ startedAtMs: day("2026-10-01T15:00:00Z"), status: "COMPLETED", actualMinutes: 25 }),
      entry({
        startedAtMs: day("2026-09-24T15:00:00Z"),
        status: "INTERRUPTED",
        actualMinutes: 10,
        categoryName: "Salud",
      }),
    ];
    const stats = computeSessionStats(entries, NOW, TZ);
    expect(stats.totalSessions).toBe(2);
    expect(stats.completedCount).toBe(1);
    expect(stats.interruptedCount).toBe(1);
    expect(stats.totalMinutes).toBe(35);
    expect(stats.byCategory.map((c) => c.name)).toEqual(["Aprender", "Salud"]);
    expect(stats.weeklyMinutes).toHaveLength(8);
    const current = stats.weeklyMinutes[7];
    expect(current.minutes).toBe(25);
    expect(stats.streakDays).toBe(1);
  });

  it("semanas vacías en 0 y orden actual al final", () => {
    const stats = computeSessionStats([], NOW, TZ);
    expect(stats.weeklyMinutes.every((w) => w.minutes === 0)).toBe(true);
    expect(stats.byCategory).toEqual([]);
  });
});
