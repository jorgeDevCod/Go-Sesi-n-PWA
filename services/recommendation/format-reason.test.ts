import { describe, expect, it } from "vitest";
import { daysSince, formatRecommendationReason } from "@/services/recommendation/format-reason";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("daysSince", () => {
  it("returns 0 for a date earlier today", () => {
    const now = Date.UTC(2026, 6, 20, 12, 0, 0);
    const earlierToday = new Date(now - 3 * 60 * 60 * 1000);
    expect(daysSince(earlierToday, now)).toBe(0);
  });

  it("returns whole days elapsed, floored", () => {
    const now = Date.UTC(2026, 6, 20, 12, 0, 0);
    const threeAndAHalfDaysAgo = new Date(now - 3.5 * DAY_MS);
    expect(daysSince(threeAndAHalfDaysAgo, now)).toBe(3);
  });

  it("never returns a negative number", () => {
    const now = Date.UTC(2026, 6, 20, 12, 0, 0);
    const future = new Date(now + DAY_MS);
    expect(daysSince(future, now)).toBe(0);
  });
});

describe("formatRecommendationReason", () => {
  it("handles never-practiced", () => {
    expect(formatRecommendationReason(null)).toBe("Todavía no la has probado.");
  });

  it("handles today", () => {
    expect(formatRecommendationReason(0)).toBe("La practicaste hoy-puedes seguir con ella.");
  });

  it("uses singular for exactly 1 day", () => {
    expect(formatRecommendationReason(1)).toBe("Hace 1 día que no la practicas.");
  });

  it("uses plural for more than 1 day", () => {
    expect(formatRecommendationReason(5)).toBe("Hace 5 días que no la practicas.");
  });
});
