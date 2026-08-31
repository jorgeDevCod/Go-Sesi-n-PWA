"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { StartSessionFlow } from "@/features/session/components/StartSessionFlow";
import { EnergyPromptModal } from "@/features/session/components/EnergyPromptModal";
import { prepareActivitiesForEnergy } from "@/features/session/sort-activities";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import {
  COMPLEXITY_LABELS,
  effectiveComplexityTargets,
  effectiveRecommendedDuration,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";
import { cn } from "@/lib/utils";
import { ActivityFilters } from "@/features/categories/components/ActivityFilters";

type SubcategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
  complexity: Complexity;
  energyLevel?: EnergyLevel | null;
  energyComplexity?: Complexity | null;
};

function subscribeNoop() {
  return () => {};
}

const COMPLEXITY_BADGE: Record<Complexity, string> = {
  LOW: "bg-surface-muted text-muted-foreground",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  HIGH: "bg-indigo-100 text-accent-aprender dark:bg-indigo-950 dark:text-indigo-400",
};

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
  const [selected, setSelected] = useState<SubcategoryOption | null>(
    () => subcategories.find((s) => s.id === startWithId) ?? null,
  );
  const [selectedEnergies, setSelectedEnergies] = useState<EnergyLevel[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Complexity[]>([]);

  const energy = prefs.energy;
  const showEnergyModal = isClient && !energy;
  const ordered = useMemo(
    () =>
      prepareActivitiesForEnergy(
        subcategories,
        energy ?? "media",
        energy ? effectiveComplexityTargets(energy, prefs) : undefined,
      ),
    [subcategories, energy, prefs],
  );

  const filtered = useMemo(() => {
    return ordered.filter((sub) => {
      const energyMatch =
        selectedEnergies.length === 0 ||
        (sub.energyLevel !== null && sub.energyLevel !== undefined &&
          selectedEnergies.includes(sub.energyLevel));
      const difficultyMatch =
        selectedDifficulties.length === 0 || selectedDifficulties.includes(sub.complexity);
      return energyMatch && difficultyMatch;
    });
  }, [ordered, selectedEnergies, selectedDifficulties]);

  if (subcategories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center">
        <p className="text-muted-foreground">
          Aún no hay actividades en {categoryName}. Crea la primera para comenzar.
        </p>
        <Link
          href="/app/subcategories"
          className="mt-4 inline-block text-sm font-medium text-foreground underline"
        >
          Crear actividad en {categoryName}
        </Link>
      </div>
    );
  }

  function handleSelectEnergy(next: EnergyLevel) {
    prefs.setEnergy(next);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
      <EnergyPromptModal
        open={showEnergyModal}
        onSelect={handleSelectEnergy}
        onSkip={() => handleSelectEnergy("media")}
      />

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="flow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <StartSessionFlow
              subcategory={selected}
              categoryName={categoryName}
              defaultMinutes={energy ? effectiveRecommendedDuration(energy, prefs) : undefined}
              energy={energy ?? "media"}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <h2 className="mb-2 text-center text-2xl font-medium text-foreground">
              ¿Qué actividad te gustaría hacer en {categoryName}?
            </h2>

            <ActivityFilters
              selectedEnergies={selectedEnergies}
              selectedDifficulties={selectedDifficulties}
              onToggleEnergy={(level) =>
                setSelectedEnergies((prev) =>
                  prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
                )
              }
              onToggleDifficulty={(value) =>
                setSelectedDifficulties((prev) =>
                  prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
                )
              }
            />

            {filtered.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
                No hay actividades que coincidan con estos filtros. Prueba con otra energía o
                dificultad.
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((sub) => (
                <motion.button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelected(sub)}
                  title={`${sub.name}-Haz clic para empezar una sesión`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left text-base font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${sub.color}33`, color: sub.color }}
                  >
                    <DynamicIcon name={sub.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{sub.name}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      COMPLEXITY_BADGE[sub.complexity],
                    )}
                  >
                    {COMPLEXITY_LABELS[sub.complexity]}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
