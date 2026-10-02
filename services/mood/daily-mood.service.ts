import { dayStartUtcInTimeZone } from "@/lib/day";
import { findMoodByUserAndDate, upsertMood } from "@/repositories/daily-mood.repository";
import type { EnergyLevel } from "../recommendation/energy-level";

const TIME_ZONE = process.env.APP_TIMEZONE ?? "America/Lima";
const VALID_ENERGIES: EnergyLevel[] = ["baja", "media", "alta"];

export function moodDate(now: Date = new Date(), timeZone: string = TIME_ZONE): Date {
  return dayStartUtcInTimeZone(now, timeZone);
}

/** Energía respondida hoy en este dispositivo-cuenta, o null. */
export async function getTodayMoodForUser(userId: string): Promise<EnergyLevel | null> {
  const row = await findMoodByUserAndDate(userId, moodDate());
  if (!row) return null;
  return VALID_ENERGIES.includes(row.energy as EnergyLevel)
    ? (row.energy as EnergyLevel)
    : null;
}

export async function saveTodayMoodForUser(userId: string, energy: EnergyLevel) {
  if (!VALID_ENERGIES.includes(energy)) {
    throw new Error("Energía inválida.");
  }
  return upsertMood(userId, moodDate(), energy);
}
