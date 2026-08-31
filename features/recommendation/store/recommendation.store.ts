import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";

type FixedRole = "min" | "rec" | "max";

type RecommendationCombo = {
  subcategoryIds: string[];
  min: number;
  rec: number;
  max: number;
  customTimes: number[];
  /**
   * Custom times that previously held a min/rec/max role and now display as
   * "ex: X". Key is the time value, value is the previous role.
   */
  exRoles?: Record<string, FixedRole>;
};

type RecommendationPrefs = {
  energy: EnergyLevel | null;
  preferredMinutes: number | null;
  dontAskAgain: boolean;
  energyDurations: Partial<Record<EnergyLevel, number>>;
  energyMinDurations: Partial<Record<EnergyLevel, number>>;
  energyMaxDurations: Partial<Record<EnergyLevel, number>>;
  energyComplexityTargets: Partial<Record<EnergyLevel, Complexity[]>>;
  difficultyDurations: Partial<Record<Complexity, number>>;
  difficultyMinDurations: Partial<Record<Complexity, number>>;
  difficultyMaxDurations: Partial<Record<Complexity, number>>;
  energyCategoryIds: Partial<Record<EnergyLevel, string[]>>;
  energySubcategoryIds: Partial<Record<EnergyLevel, string[]>>;
  recommendationCombos: Record<string, RecommendationCombo>;
  setEnergy: (energy: EnergyLevel) => void;
  setPreferredMinutes: (minutes: number | null) => void;
  setDontAskAgain: (value: boolean) => void;
  setEnergyDuration: (energy: EnergyLevel, minutes: number | null) => void;
  setEnergyMinDuration: (energy: EnergyLevel, minutes: number | null) => void;
  setEnergyMaxDuration: (energy: EnergyLevel, minutes: number | null) => void;
  setEnergyComplexityTargets: (energy: EnergyLevel, targets: Complexity[]) => void;
  setDifficultyDuration: (complexity: Complexity, minutes: number | null) => void;
  setDifficultyMinDuration: (complexity: Complexity, minutes: number | null) => void;
  setDifficultyMaxDuration: (complexity: Complexity, minutes: number | null) => void;
  setEnergyCategoryIds: (energy: EnergyLevel, ids: string[]) => void;
  setEnergySubcategoryIds: (energy: EnergyLevel, ids: string[]) => void;
  setRecommendationCombo: (key: string, combo: RecommendationCombo) => void;
  removeRecommendationCombo: (key: string) => void;
  resetEnergyPrefs: () => void;
  reset: () => void;
};

function numericField<TKey extends string, TVal extends number | null>(
  field: Partial<Record<TKey, number>>,
  key: TKey,
  value: TVal,
): Partial<Record<TKey, number>> {
  const next = { ...field };
  if (value === null) {
    delete next[key];
  } else {
    next[key] = value;
  }
  return next;
}

export const useRecommendationPrefs = create<RecommendationPrefs>()(
  persist(
    (set) => ({
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
      setEnergy: (energy) => set({ energy }),
      setPreferredMinutes: (minutes) => set({ preferredMinutes: minutes }),
      setDontAskAgain: (value) => set({ dontAskAgain: value }),
      setEnergyDuration: (energy, minutes) =>
        set((state) => ({
          energyDurations: numericField(state.energyDurations, energy, minutes),
        })),
      setEnergyMinDuration: (energy, minutes) =>
        set((state) => ({
          energyMinDurations: numericField(state.energyMinDurations, energy, minutes),
        })),
      setEnergyMaxDuration: (energy, minutes) =>
        set((state) => ({
          energyMaxDurations: numericField(state.energyMaxDurations, energy, minutes),
        })),
      setEnergyComplexityTargets: (energy, targets) =>
        set((state) => ({
          energyComplexityTargets: {
            ...state.energyComplexityTargets,
            [energy]: targets,
          },
        })),
      setDifficultyDuration: (complexity, minutes) =>
        set((state) => ({
          difficultyDurations: numericField(state.difficultyDurations, complexity, minutes),
        })),
      setDifficultyMinDuration: (complexity, minutes) =>
        set((state) => ({
          difficultyMinDurations: numericField(state.difficultyMinDurations, complexity, minutes),
        })),
      setDifficultyMaxDuration: (complexity, minutes) =>
        set((state) => ({
          difficultyMaxDurations: numericField(state.difficultyMaxDurations, complexity, minutes),
        })),
      setEnergyCategoryIds: (energy, ids) =>
        set((state) => ({
          energyCategoryIds: { ...state.energyCategoryIds, [energy]: ids },
        })),
      setEnergySubcategoryIds: (energy, ids) =>
        set((state) => ({
          energySubcategoryIds: { ...state.energySubcategoryIds, [energy]: ids },
        })),
      setRecommendationCombo: (key, combo) =>
        set((state) => ({
          recommendationCombos: { ...state.recommendationCombos, [key]: combo },
        })),
      removeRecommendationCombo: (key) =>
        set((state) => {
          const rest = { ...state.recommendationCombos };
          delete rest[key];
          return { recommendationCombos: rest };
        }),
      resetEnergyPrefs: () =>
        set({
          energyDurations: {},
          energyMinDurations: {},
          energyMaxDurations: {},
          energyComplexityTargets: {},
          difficultyDurations: {},
          difficultyMinDurations: {},
          difficultyMaxDurations: {},
        }),
      reset: () =>
        set({
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
        }),
    }),
    {
      name: "gosession-recommendation-prefs",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Overrides serializables listos para enviar al servidor. */
export function recommendationOverridesFromPrefs(
  prefs: Pick<
    RecommendationPrefs,
    | "energyDurations"
    | "energyMinDurations"
    | "energyMaxDurations"
    | "energyComplexityTargets"
    | "difficultyDurations"
    | "difficultyMinDurations"
    | "difficultyMaxDurations"
    | "energyCategoryIds"
    | "energySubcategoryIds"
    | "recommendationCombos"
  >,
) {
  return {
    energyDurations: prefs.energyDurations,
    energyMinDurations: prefs.energyMinDurations,
    energyMaxDurations: prefs.energyMaxDurations,
    energyComplexityTargets: prefs.energyComplexityTargets,
    difficultyDurations: prefs.difficultyDurations,
    difficultyMinDurations: prefs.difficultyMinDurations,
    difficultyMaxDurations: prefs.difficultyMaxDurations,
    energyCategoryIds: prefs.energyCategoryIds,
    energySubcategoryIds: prefs.energySubcategoryIds,
    combos: prefs.recommendationCombos,
  };
}
