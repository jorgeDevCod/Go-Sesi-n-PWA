"use client";

import { useSyncExternalStore } from "react";
import { StartSessionFlow } from "@/features/session/components/StartSessionFlow";
import { EnergyPromptModal } from "@/features/session/components/EnergyPromptModal";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import {
  suggestedMinutesFor,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { PomodoroConfig } from "@/services/session/pomodoro";

type SubcategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
  complexity: Complexity;
  energyLevel?: EnergyLevel | null;
  energyComplexity?: Complexity | null;
  pomodoroConfig?: PomodoroConfig | null;
  lastClassicMinutes?: number | null;
  lastMode?: "CLASSIC" | "POMODORO" | null;
};

function subscribeNoop() {
  return () => {};
}

/**
 * Arranque de una actividad concreta. La selección de categoría/actividad
 * vive en Personalizar → Actividades, así que aquí no duplicamos la lista.
 */
export function SessionWizard({
  categoryName,
  subcategories,
  startWithId,
}: {
  categoryName: string;
  subcategories: SubcategoryOption[];
  startWithId?: string;
}) {
  const prefs = useRecommendationPrefs();
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const selected = subcategories.find((sub) => sub.id === startWithId);

  if (!selected) return null;

  const energy = prefs.energy;
  const showEnergyModal = isClient && !energy;

  return (
    <div className="flex w-full flex-col gap-2">
      <EnergyPromptModal
        open={showEnergyModal}
        onSelect={(next) => prefs.setEnergy(next)}
        onSkip={() => prefs.setEnergy("media")}
      />
      <StartSessionFlow
        subcategory={selected}
        categoryName={categoryName}
        defaultMinutes={
          energy ? suggestedMinutesFor(energy, selected.complexity, prefs) : undefined
        }
        energy={energy ?? "media"}
        complexity={selected.complexity}
        activityPomodoroConfig={selected.pomodoroConfig ?? null}
        lastClassicMinutes={selected.lastClassicMinutes ?? null}
        lastMode={selected.lastMode ?? null}
      />
    </div>
  );
}
