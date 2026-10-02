import { describe, expect, it } from "vitest";
import {
  decidePrefsSync,
  isEmptyLocalPrefs,
  isEmptyServerPrefs,
  localToServerInput,
  type LocalPrefsSnapshot,
} from "./prefs-sync";

function local(overrides: Partial<LocalPrefsSnapshot> = {}): LocalPrefsSnapshot {
  return {
    energy: null,
    preferredMinutes: null,
    dontAskAgain: false,
    energyDurations: {},
    energyMinDurations: {},
    energyMaxDurations: {},
    energyComplexityTargets: {},
    difficultyDurations: {},
    difficultyMinDurations: {},
    difficultyMaxDurations: {},
    energyCategoryIds: {},
    energySubcategoryIds: {},
    recommendationCombos: {},
    ...overrides,
  };
}

describe("prefs-sync", () => {
  it("ambos vacíos → none", () => {
    const server = { energy: null, preferredMinutes: null, dontAskAgain: false, data: {} };
    expect(decidePrefsSync(server, local()).action).toBe("none");
    expect(isEmptyServerPrefs(server)).toBe(true);
    expect(isEmptyLocalPrefs(local())).toBe(true);
  });

  it("servidor con datos → apply-server (manda servidor)", () => {
    const server = {
      energy: "alta" as const,
      preferredMinutes: 25,
      dontAskAgain: true,
      data: { energyDurations: { alta: 40 } },
    };
    const decision = decidePrefsSync(server, local({ energy: "baja" }));
    expect(decision.action).toBe("apply-server");
    if (decision.action === "apply-server") {
      expect(decision.snapshot.energy).toBe("alta");
      expect(decision.snapshot.energyDurations).toEqual({ alta: 40 });
    }
  });

  it("servidor vacío + local con datos → push-local (migración)", () => {
    const server = { energy: null, preferredMinutes: null, dontAskAgain: false, data: {} };
    const decision = decidePrefsSync(server, local({ energy: "media", dontAskAgain: true }));
    expect(decision.action).toBe("push-local");
  });

  it("localToServerInput separa escalares del blob", () => {
    const input = localToServerInput(local({ energy: "baja", preferredMinutes: 15 }));
    expect(input.energy).toBe("baja");
    expect(input.preferredMinutes).toBe(15);
    expect(input.data.energyDurations).toEqual({});
    expect(input.data.recommendationCombos).toEqual({});
  });
});
