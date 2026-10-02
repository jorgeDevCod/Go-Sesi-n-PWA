import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTodayMoodForUser, moodDate, saveTodayMoodForUser } from "./daily-mood.service";

const { mocks } = vi.hoisted(() => ({
  mocks: { findMoodByUserAndDate: vi.fn(), upsertMood: vi.fn() },
}));

vi.mock("@/repositories/daily-mood.repository", () => ({ ...mocks }));

describe("daily-mood.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("moodDate usa el día Lima aunque el servidor vea otro día", () => {
    // 2026-10-02 01:00 UTC = 2026-10-01 20:00 Lima.
    expect(moodDate(new Date("2026-10-02T01:00:00.000Z"), "America/Lima").toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
  });

  it("sin fila devuelve null", async () => {
    mocks.findMoodByUserAndDate.mockResolvedValue(null);
    await expect(getTodayMoodForUser("u1")).resolves.toBeNull();
  });

  it("devuelve la energía de hoy y guarda con upsert", async () => {
    mocks.findMoodByUserAndDate.mockResolvedValue({ energy: "alta" });
    await expect(getTodayMoodForUser("u1")).resolves.toBe("alta");
    mocks.upsertMood.mockResolvedValue({ id: "m1" });
    await saveTodayMoodForUser("u1", "baja");
    expect(mocks.upsertMood).toHaveBeenCalledWith(
      "u1",
      expect.any(Date),
      "baja",
    );
  });

  it("rechaza energía inválida sin escribir", async () => {
    await expect(saveTodayMoodForUser("u1", "x" as never)).rejects.toThrow("Energía inválida.");
    expect(mocks.upsertMood).not.toHaveBeenCalled();
  });
});
