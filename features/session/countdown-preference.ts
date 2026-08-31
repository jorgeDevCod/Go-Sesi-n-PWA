const STORAGE_KEY = "gosession-countdown-seconds";
export const COUNTDOWN_OPTIONS = [0, 3, 5, 7] as const;
const DEFAULT_COUNTDOWN_SECONDS = 3;

export function getStoredCountdownSeconds(): number {
  if (typeof window === "undefined") return DEFAULT_COUNTDOWN_SECONDS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw === null ? NaN : Number(raw);
    return COUNTDOWN_OPTIONS.includes(parsed as (typeof COUNTDOWN_OPTIONS)[number])
      ? parsed
      : DEFAULT_COUNTDOWN_SECONDS;
  } catch {
    return DEFAULT_COUNTDOWN_SECONDS;
  }
}

export function setStoredCountdownSeconds(seconds: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(seconds));
  } catch {
    // Storage can be unavailable (private mode, quota)-the preference
    // just won't persist; not worth surfacing an error for this.
  }
}
