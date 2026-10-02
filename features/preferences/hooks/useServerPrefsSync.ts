"use client";

import { useEffect, useRef } from "react";
import {
  getPreferencesAction,
  savePreferencesAction,
  getTodayMoodAction,
  saveMoodAction,
} from "@/features/preferences/actions/preferences.actions";
import {
  decidePrefsSync,
  localToServerInput,
  type LocalPrefsSnapshot,
} from "@/features/preferences/prefs-sync";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import { hasAnsweredMoodToday, markMoodAnsweredToday } from "@/features/recommendation/mood.storage";
import { enqueueOffline, isOnline } from "@/features/offline/queue-flush";

/** Foto del store local en forma sincronizable. */
export function snapshotLocalPrefs(): LocalPrefsSnapshot {
  const s = useRecommendationPrefs.getState();
  return {
    energy: s.energy,
    preferredMinutes: s.preferredMinutes,
    dontAskAgain: s.dontAskAgain,
    energyDurations: s.energyDurations,
    energyMinDurations: s.energyMinDurations,
    energyComplexityTargets: s.energyComplexityTargets,
    energyMaxDurations: s.energyMaxDurations,
    difficultyDurations: s.difficultyDurations,
    difficultyMinDurations: s.difficultyMinDurations,
    difficultyMaxDurations: s.difficultyMaxDurations,
    energyCategoryIds: s.energyCategoryIds,
    energySubcategoryIds: s.energySubcategoryIds,
    recommendationCombos: s.recommendationCombos,
  };
}

/**
 * Sincroniza prefs y ánimo con el servidor una vez al montar, y sube cambios
 * locales con debounce. Todo best-effort: sin red, `localStorage` sigue
 * mandando y nada se rompe.
 */
export function useServerPrefsSync() {
  const didSync = useRef(false);

  useEffect(() => {
    if (didSync.current) return;
    didSync.current = true;

    (async () => {
      try {
        const [prefsRes, moodRes] = await Promise.all([
          getPreferencesAction(),
          getTodayMoodAction(),
        ]);

        if (prefsRes.success) {
          const decision = decidePrefsSync(prefsRes.prefs, snapshotLocalPrefs());
          if (decision.action === "apply-server") {
            useRecommendationPrefs.setState(decision.snapshot);
          } else if (decision.action === "push-local") {
            await savePreferencesAction(localToServerInput(decision.snapshot));
          }
        }

        if (moodRes.success && moodRes.energy) {
          const store = useRecommendationPrefs.getState();
          if (!store.energy) store.setEnergy(moodRes.energy);
          markMoodAnsweredToday();
        } else if (moodRes.success) {
          const store = useRecommendationPrefs.getState();
          if (hasAnsweredMoodToday() && store.energy) {
            await saveMoodAction(store.energy);
          }
        }
      } catch {
        // Offline o error: el estado local sigue siendo la fuente.
      }
    })();

    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useRecommendationPrefs.subscribe(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void (async () => {
          try {
            const input = localToServerInput(snapshotLocalPrefs());
            // Sin red: se encola (upsert idempotente) en vez de perder el cambio.
            if (!isOnline()) {
              enqueueOffline("prefs", input, "prefs");
              return;
            }
            await savePreferencesAction(input);
          } catch {
            // Best-effort: se reintentará en el próximo cambio.
          }
        })();
      }, 800);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, []);
}
