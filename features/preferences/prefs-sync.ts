import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";
import type { ServerPrefs } from "@/services/preferences/user-preferences.service";

/**
 * Estrategia de sincronización prefs local ↔ servidor (4B).
 *
 * - Servidor con datos → manda el servidor (consistencia multidispositivo).
 * - Servidor vacío + local con datos → se sube lo local una vez (migración).
 * - Ambos vacíos → no se hace nada.
 * `localStorage` sigue como fallback offline; aquí solo se decide.
 */

type FixedRole = "min" | "rec" | "max";

export type LocalPrefsSnapshot = {
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
  recommendationCombos: Record<
    string,
    {
      subcategoryIds: string[];
      min: number;
      rec: number;
      max: number;
      customTimes: number[];
      exRoles?: Record<string, FixedRole>;
    }
  >;
};

const DATA_KEYS = [
  "energyDurations",
  "energyMinDurations",
  "energyMaxDurations",
  "energyComplexityTargets",
  "difficultyDurations",
  "difficultyMinDurations",
  "difficultyMaxDurations",
  "energyCategoryIds",
  "energySubcategoryIds",
  "recommendationCombos",
] as const;

function isEmptyRecord(value: unknown): boolean {
  return typeof value !== "object" || value === null || Object.keys(value).length === 0;
}

export function isEmptyServerPrefs(prefs: ServerPrefs): boolean {
  return (
    prefs.energy === null &&
    prefs.preferredMinutes === null &&
    prefs.dontAskAgain === false &&
    isEmptyRecord(prefs.data)
  );
}

export function isEmptyLocalPrefs(local: LocalPrefsSnapshot): boolean {
  if (local.energy !== null || local.preferredMinutes !== null || local.dontAskAgain) {
    return false;
  }
  return DATA_KEYS.every((key) => isEmptyRecord(local[key]));
}

/** Blob `data` del servidor → forma del store local (claves ya compatibles). */
export function serverDataToLocal(
  data: Record<string, unknown>,
): Partial<LocalPrefsSnapshot> {
  const next: Partial<LocalPrefsSnapshot> = {};
  for (const key of DATA_KEYS) {
    if (data[key] !== undefined) {
      (next as Record<string, unknown>)[key] = data[key];
    }
  }
  return next;
}

export type PrefsSyncDecision =
  | { action: "apply-server"; snapshot: Partial<LocalPrefsSnapshot> & Pick<LocalPrefsSnapshot, "energy" | "preferredMinutes" | "dontAskAgain"> }
  | { action: "push-local"; snapshot: LocalPrefsSnapshot }
  | { action: "none" };

export function decidePrefsSync(
  server: ServerPrefs,
  local: LocalPrefsSnapshot,
): PrefsSyncDecision {
  if (!isEmptyServerPrefs(server)) {
    return {
      action: "apply-server",
      snapshot: {
        energy: server.energy,
        preferredMinutes: server.preferredMinutes,
        dontAskAgain: server.dontAskAgain,
        ...serverDataToLocal(server.data),
      },
    };
  }
  if (!isEmptyLocalPrefs(local)) {
    return { action: "push-local", snapshot: local };
  }
  return { action: "none" };
}

/** Snapshot local → input de `savePreferencesAction` (resto va en `data`). */
export function localToServerInput(local: LocalPrefsSnapshot): {
  energy: EnergyLevel | null;
  preferredMinutes: number | null;
  dontAskAgain: boolean;
  data: Record<string, unknown>;
} {
  const data: Record<string, unknown> = {};
  for (const key of DATA_KEYS) {
    data[key] = local[key];
  }
  return {
    energy: local.energy,
    preferredMinutes: local.preferredMinutes,
    dontAskAgain: local.dontAskAgain,
    data,
  };
}
