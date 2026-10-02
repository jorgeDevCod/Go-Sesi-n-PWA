import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPreferencesForUser, savePreferencesForUser } from "./user-preferences.service";

const { mocks } = vi.hoisted(() => ({
  mocks: { findPreferenceByUserId: vi.fn(), upsertPreference: vi.fn() },
}));

vi.mock("@/repositories/user-preferences.repository", () => ({ ...mocks }));

describe("user-preferences.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sin fila devuelve defaults", async () => {
    mocks.findPreferenceByUserId.mockResolvedValue(null);
    await expect(getPreferencesForUser("u1")).resolves.toEqual({
      energy: null,
      preferredMinutes: null,
      dontAskAgain: false,
      data: {},
    });
  });

  it("mapea fila a prefs y sanea energía/data corruptas", async () => {
    mocks.findPreferenceByUserId.mockResolvedValue({
      energy: "rara",
      preferredMinutes: 25,
      dontAskAgain: true,
      data: [1, 2],
    });
    await expect(getPreferencesForUser("u1")).resolves.toEqual({
      energy: null,
      preferredMinutes: 25,
      dontAskAgain: true,
      data: {},
    });
  });

  it("guarda parcial sin tocar lo demás", async () => {
    mocks.upsertPreference.mockResolvedValue({ id: "p1" });
    await savePreferencesForUser("u1", { dontAskAgain: true });
    expect(mocks.upsertPreference).toHaveBeenCalledWith("u1", { dontAskAgain: true });
  });

  it("rechaza energía y duración inválidas", async () => {
    await expect(savePreferencesForUser("u1", { energy: "x" as never })).rejects.toThrow(
      "Energía inválida.",
    );
    await expect(savePreferencesForUser("u1", { preferredMinutes: -5 })).rejects.toThrow(
      "Duración inválida.",
    );
    expect(mocks.upsertPreference).not.toHaveBeenCalled();
  });
});
