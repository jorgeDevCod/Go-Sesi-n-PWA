import {
  findPreferenceByUserId,
  upsertPreference,
  type PreferenceWrite,
} from "@/repositories/user-preferences.repository";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { EnergyLevel } from "../recommendation/energy-level";

export type ServerPrefs = {
  energy: EnergyLevel | null;
  preferredMinutes: number | null;
  dontAskAgain: boolean;
  /** Blob opaco con el resto (durations, targets, ids, combos del cliente). */
  data: Record<string, unknown>;
};

const VALID_ENERGIES: EnergyLevel[] = ["baja", "media", "alta"];

function parseData(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export async function getPreferencesForUser(userId: string): Promise<ServerPrefs> {
  const row = await findPreferenceByUserId(userId);
  if (!row) {
    return { energy: null, preferredMinutes: null, dontAskAgain: false, data: {} };
  }
  return {
    energy: VALID_ENERGIES.includes(row.energy as EnergyLevel)
      ? (row.energy as EnergyLevel)
      : null,
    preferredMinutes: row.preferredMinutes,
    dontAskAgain: row.dontAskAgain,
    data: parseData(row.data),
  };
}

export type SavePrefsInput = {
  energy?: EnergyLevel | null;
  preferredMinutes?: number | null;
  dontAskAgain?: boolean;
  data?: Record<string, unknown>;
};

export async function savePreferencesForUser(userId: string, input: SavePrefsInput) {
  const write: PreferenceWrite = {};
  if (input.energy !== undefined) {
    if (input.energy !== null && !VALID_ENERGIES.includes(input.energy)) {
      throw new Error("Energía inválida.");
    }
    write.energy = input.energy;
  }
  if (input.preferredMinutes !== undefined) {
    if (
      input.preferredMinutes !== null &&
      (!Number.isInteger(input.preferredMinutes) || input.preferredMinutes <= 0)
    ) {
      throw new Error("Duración inválida.");
    }
    write.preferredMinutes = input.preferredMinutes;
  }
  if (input.dontAskAgain !== undefined) write.dontAskAgain = input.dontAskAgain;
  // Llega de JSON (serializable); el cast acota el tipo Prisma sin validación extra.
  if (input.data !== undefined) write.data = input.data as Prisma.InputJsonValue;
  return upsertPreference(userId, write);
}
