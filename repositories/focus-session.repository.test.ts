import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPracticedSubcategoryIdsToday } from "./focus-session.repository";

const { mocks } = vi.hoisted(() => ({
  mocks: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { focusSession: { findMany: mocks.findMany } },
}));

describe("getPracticedSubcategoryIdsToday", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve los subcategoryId con sesión hoy en Lima", async () => {
    mocks.findMany.mockResolvedValue([{ subcategoryId: "sub-1" }, { subcategoryId: "sub-2" }]);
    const result = await getPracticedSubcategoryIdsToday(
      "user-1",
      new Date("2026-10-02T01:00:00.000Z"),
      "America/Lima",
    );
    expect(result).toEqual(new Set(["sub-1", "sub-2"]));
  });

  it("usa la ventana del día Lima, no del servidor", async () => {
    mocks.findMany.mockResolvedValue([]);
    // 01:00 UTC = 20:00 del día anterior en Lima → ventana del 10-01.
    await getPracticedSubcategoryIdsToday(
      "user-1",
      new Date("2026-10-02T01:00:00.000Z"),
      "America/Lima",
    );
    const where = mocks.findMany.mock.calls[0][0].where;
    expect(where.userId).toBe("user-1");
    expect(where.startedAt.gte.toISOString()).toBe("2026-10-01T00:00:00.000Z");
    expect(where.startedAt.lt.toISOString()).toBe("2026-10-02T00:00:00.000Z");
  });
});
