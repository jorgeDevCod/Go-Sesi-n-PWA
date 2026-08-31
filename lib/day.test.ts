import { describe, expect, it } from "vitest";
import { todayKey } from "./day";

describe("todayKey", () => {
  it("formatea la fecha local como YYYY-MM-DD", () => {
    expect(todayKey(new Date(2026, 7, 3))).toBe("2026-08-03");
  });

  it("agrega ceros a la izquierda", () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
