import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useServerPrefsSync } from "./useServerPrefsSync";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    getPreferencesAction: vi.fn(),
    savePreferencesAction: vi.fn(),
    getTodayMoodAction: vi.fn(),
    saveMoodAction: vi.fn(),
  },
}));

vi.mock("@/features/preferences/actions/preferences.actions", () => ({ ...mocks }));

vi.mock("@/features/offline/queue-flush", () => ({
  isOnline: () => true,
  enqueueOffline: vi.fn(),
  flushOfflineQueue: vi.fn(),
}));

const EMPTY_SERVER = { energy: null, preferredMinutes: null, dontAskAgain: false, data: {} };

function resetStore() {
  useRecommendationPrefs.setState({
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
  });
  window.localStorage.clear();
}

describe("useServerPrefsSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it("servidor con datos → aplica al store", async () => {
    mocks.getPreferencesAction.mockResolvedValue({
      success: true,
      prefs: { ...EMPTY_SERVER, energy: "alta", dontAskAgain: true },
    });
    mocks.getTodayMoodAction.mockResolvedValue({ success: true, energy: null });
    renderHook(() => useServerPrefsSync());
    await waitFor(() => expect(useRecommendationPrefs.getState().energy).toBe("alta"));
    expect(useRecommendationPrefs.getState().dontAskAgain).toBe(true);
  });

  it("servidor vacío + local con datos → sube lo local", async () => {
    useRecommendationPrefs.getState().setEnergy("media");
    mocks.getPreferencesAction.mockResolvedValue({ success: true, prefs: EMPTY_SERVER });
    mocks.getTodayMoodAction.mockResolvedValue({ success: true, energy: null });
    renderHook(() => useServerPrefsSync());
    await waitFor(() => expect(mocks.savePreferencesAction).toHaveBeenCalled());
    const input = mocks.savePreferencesAction.mock.calls[0][0];
    expect(input.energy).toBe("media");
  });

  it("ánimo del servidor marca el guard local", async () => {
    mocks.getPreferencesAction.mockResolvedValue({ success: true, prefs: EMPTY_SERVER });
    mocks.getTodayMoodAction.mockResolvedValue({ success: true, energy: "baja" });
    renderHook(() => useServerPrefsSync());
    await waitFor(() =>
      expect(window.localStorage.getItem("gosession-mood-answered-" + todayKey())).toBe("1"),
    );
  });

  it("cambios locales se suben con debounce", () => {
    vi.useFakeTimers();
    try {
      mocks.getPreferencesAction.mockResolvedValue({ success: true, prefs: EMPTY_SERVER });
      mocks.getTodayMoodAction.mockResolvedValue({ success: true, energy: null });
      renderHook(() => useServerPrefsSync());
      // Sync inicial con todo vacío: decide "none", nunca guarda.
      act(() => {
        useRecommendationPrefs.getState().setDontAskAgain(true);
      });
      expect(mocks.savePreferencesAction).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(900);
      });
      expect(mocks.savePreferencesAction).toHaveBeenCalledTimes(1);
      expect(mocks.savePreferencesAction.mock.calls[0][0].dontAskAgain).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

function todayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}
