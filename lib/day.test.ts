import { describe, expect, it } from "vitest";
import { dayStartUtcInTimeZone, todayKey } from "./day";

describe("todayKey", () => {
  it("formatea la fecha local como YYYY-MM-DD", () => {
    expect(todayKey(new Date(2026, 7, 3))).toBe("2026-08-03");
  });

  it("agrega ceros a la izquierda", () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("dayStartUtcInTimeZone", () => {
  it("Lima 20:00 sigue siendo el día Lima aunque en UTC ya sea el siguiente", () => {
    // 2026-10-01 20:00 Lima = 2026-10-02 01:00 UTC.
    const at = new Date("2026-10-02T01:00:00.000Z");
    expect(dayStartUtcInTimeZone(at, "America/Lima").toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
  });

  it("Lima 00:30 ya es el nuevo día Lima", () => {
    // 2026-10-02 00:30 Lima = 2026-10-02 05:30 UTC.
    const at = new Date("2026-10-02T05:30:00.000Z");
    expect(dayStartUtcInTimeZone(at, "America/Lima").toISOString()).toBe(
      "2026-10-02T00:00:00.000Z",
    );
  });

  it("no depende del TZ del servidor (caso UTC idéntico)", () => {
    const at = new Date("2026-10-02T01:00:00.000Z");
    expect(dayStartUtcInTimeZone(at, "UTC").toISOString()).toBe(
      "2026-10-02T00:00:00.000Z",
    );
  });
});
