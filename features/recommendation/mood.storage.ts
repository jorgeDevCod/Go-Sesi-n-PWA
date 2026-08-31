import { todayKey } from "@/lib/day";

const MOOD_PREFIX = "gosession-mood-answered-";

/** ¿Respondió la pregunta de ánimo hoy? */
export function hasAnsweredMoodToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(`${MOOD_PREFIX}${todayKey()}`) === "1";
  } catch {
    return false;
  }
}

/** Marca que hoy ya se respondió la pregunta de ánimo. */
export function markMoodAnsweredToday(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${MOOD_PREFIX}${todayKey()}`, "1");
  } catch {
    // Storage unavailable.
  }
}

/** Limpia el guard diario (para tests/preferencias). */
export function clearMoodAnswered(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${MOOD_PREFIX}${todayKey()}`);
  } catch {
    // Storage unavailable.
  }
}
