import type { PomodoroConfig } from "@/services/session/pomodoro";

export type ActivityTimerMode = "CLASSIC" | "POMODORO";

export type ActivityTimerPreference = {
  mode: ActivityTimerMode;
  classicMinutes?: number;
  pomodoroConfig?: PomodoroConfig | null;
};

const STORAGE_KEY = "gosession-activity-timer-prefs";

type StoredPreferences = Record<string, ActivityTimerPreference>;

function readAll(): StoredPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as StoredPreferences)
      : {};
  } catch {
    return {};
  }
}

export function getActivityTimerPreference(
  subcategoryId: string,
): ActivityTimerPreference | null {
  return readAll()[subcategoryId] ?? null;
}

export function setActivityTimerPreference(
  subcategoryId: string,
  preference: ActivityTimerPreference,
): void {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    all[subcategoryId] = preference;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable: la preferencia del servidor sigue siendo la fuente.
  }
}

export function clearActivityTimerPreferences(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable.
  }
}
