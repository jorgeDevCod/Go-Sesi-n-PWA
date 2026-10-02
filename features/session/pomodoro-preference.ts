const STORAGE_KEY = "gosession-pomodoro-autostart";

export function getStoredPomodoroAutoStart(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setStoredPomodoroAutoStart(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Storage can be unavailable-the preference just won't persist.
  }
}
