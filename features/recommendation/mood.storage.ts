import { todayKey } from "@/lib/day";

const LEGACY_MOOD_PREFIX = "gosession-mood-answered-";
const SUPPRESS_PREFIX = "gosession-mood-suppressed-";
const SHOWN_THIS_SESSION_KEY = "gosession-mood-prompt-shown";

/** ¿El usuario pidió no volver a ver el modal de energía hoy? */
export function isMoodPromptSuppressedToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(`${SUPPRESS_PREFIX}${todayKey()}`) === "1" ||
      window.localStorage.getItem(`${LEGACY_MOOD_PREFIX}${todayKey()}`) === "1"
    );
  } catch {
    return false;
  }
}

/** Suprime el modal de energía durante el resto del día. */
export function suppressMoodPromptToday(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${SUPPRESS_PREFIX}${todayKey()}`, "1");
  } catch {
    // Storage unavailable.
  }
}

/** Evita repetir el modal en cada navegación dentro de la misma apertura. */
export function hasShownMoodPromptThisSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SHOWN_THIS_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markMoodPromptShownThisSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SHOWN_THIS_SESSION_KEY, "1");
  } catch {
    // Storage unavailable.
  }
}

/** Compatibilidad con el flujo anterior. */
export function hasAnsweredMoodToday(): boolean {
  return isMoodPromptSuppressedToday();
}

export function markMoodAnsweredToday(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${LEGACY_MOOD_PREFIX}${todayKey()}`, "1");
  } catch {
    // Storage unavailable.
  }
  suppressMoodPromptToday();
}

export function clearMoodAnswered(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${SUPPRESS_PREFIX}${todayKey()}`);
    window.localStorage.removeItem(`${LEGACY_MOOD_PREFIX}${todayKey()}`);
    window.sessionStorage.removeItem(SHOWN_THIS_SESSION_KEY);
  } catch {
    // Storage unavailable.
  }
}
