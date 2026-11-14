const SOUND_ENABLED_KEY = "gosession-sounds-enabled";

export function areSoundsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SOUND_ENABLED_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setSoundsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "1" : "0");
  } catch {
    // Storage unavailable.
  }
}
