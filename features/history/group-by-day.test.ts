import { describe, expect, it } from "vitest";
import { formatDayLabel, groupSessionsByDay } from "@/features/history/group-by-day";

function localMs(year: number, month: number, day: number, hour = 12): number {
  // month is 1-indexed here to keep test fixtures readable.
  return new Date(year, month - 1, day, hour).getTime();
}

describe("groupSessionsByDay", () => {
  it("groups entries from the same local day together", () => {
    const entries = [
      { id: "a", startedAtMs: localMs(2026, 8, 15, 9) },
      { id: "b", startedAtMs: localMs(2026, 8, 15, 20) },
    ];
    const groups = groupSessionsByDay(entries);
    expect(groups).toHaveLength(1);
    expect(groups[0].dateKey).toBe("2026-08-15");
    expect(groups[0].entries).toHaveLength(2);
  });

  it("separates entries from different days", () => {
    const entries = [
      { id: "a", startedAtMs: localMs(2026, 8, 14) },
      { id: "b", startedAtMs: localMs(2026, 8, 15) },
    ];
    expect(groupSessionsByDay(entries)).toHaveLength(2);
  });

  it("sorts groups most-recent-day first", () => {
    const entries = [
      { id: "old", startedAtMs: localMs(2026, 7, 1) },
      { id: "new", startedAtMs: localMs(2026, 8, 15) },
      { id: "mid", startedAtMs: localMs(2026, 7, 20) },
    ];
    const groups = groupSessionsByDay(entries);
    expect(groups.map((g) => g.dateKey)).toEqual(["2026-08-15", "2026-07-20", "2026-07-01"]);
  });

  it("handles a month boundary correctly", () => {
    const entries = [
      { id: "a", startedAtMs: localMs(2026, 7, 31) },
      { id: "b", startedAtMs: localMs(2026, 8, 1) },
    ];
    const groups = groupSessionsByDay(entries);
    expect(groups.map((g) => g.dateKey)).toEqual(["2026-08-01", "2026-07-31"]);
  });

  it("returns an empty array for no entries", () => {
    expect(groupSessionsByDay([])).toEqual([]);
  });
});

describe("formatDayLabel", () => {
  it("formats the date as dd/mm/yyyy and capitalizes the Spanish weekday", () => {
    const { date, dayName } = formatDayLabel("2026-08-15");
    expect(date).toBe("15/08/2026");
    expect(dayName).toBe("Sábado");
  });

  it("pads single-digit day and month", () => {
    const { date } = formatDayLabel("2026-01-05");
    expect(date).toBe("05/01/2026");
  });
});
