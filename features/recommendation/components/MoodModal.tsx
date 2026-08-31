"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BatteryFull, BatteryLow, BatteryMedium, Check, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import { markMoodAnsweredToday } from "@/features/recommendation/mood.storage";
import {
  ENERGY_COLORS,
  ENERGY_LABELS,
  ENERGY_ACTIVITY_DESCRIPTIONS,
  effectiveRecommendedDuration,
  effectiveMaxLabel,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";

function subscribeNoop() {
  return () => {};
}

const ENERGY_OPTIONS: { level: EnergyLevel; icon: typeof BatteryLow }[] = [
  { level: "baja", icon: BatteryLow },
  { level: "media", icon: BatteryMedium },
  { level: "alta", icon: BatteryFull },
];

const ENERGY_NAMES: Record<EnergyLevel, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export function MoodModal({
  open,
  userName,
  onClose,
}: {
  open: boolean;
  userName: string;
  onClose: () => void;
}) {
  const prefs = useRecommendationPrefs();
  const [energy, setEnergy] = useState<EnergyLevel>("media");
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  if (typeof document === "undefined") return null;

  const suggested = effectiveRecommendedDuration(energy, prefs);

  function handleConfirm() {
    prefs.setEnergy(energy);
    prefs.setPreferredMinutes(suggested);
    markMoodAnsweredToday();
    onClose();
  }

  function handleDismissToday() {
    markMoodAnsweredToday();
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="¿Cómo te sientes hoy?"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender">
                <PartyPopper className="size-6" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                ¿Cómo te sientes hoy, {userName}?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Con tu ánimo personalizo las categorías y los tiempos para hoy.
              </p>
              <p className="rounded-2xl bg-accent-aprender/5 px-3 py-2 text-xs leading-relaxed text-accent-aprender">
                Te preguntamos tu ánimo cada día para adaptar Go Sesión a tu estado de ánimo
                y ofrecerte la mejor experiencia.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {ENERGY_OPTIONS.map(({ level, icon: Icon }) => {
                const isSelected = energy === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setEnergy(level)}
                    aria-pressed={isSelected}
                    style={{
                      borderColor: isSelected ? ENERGY_COLORS[level] : undefined,
                      backgroundColor: isSelected ? `${ENERGY_COLORS[level]}14` : undefined,
                      boxShadow: isSelected ? `0 8px 18px -6px ${ENERGY_COLORS[level]}55` : undefined,
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                      !isSelected && "border-border bg-surface hover:bg-surface-hover",
                    )}
                  >
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200"
                      style={{
                        backgroundColor: isSelected ? ENERGY_COLORS[level] : `${ENERGY_COLORS[level]}1f`,
                        color: isSelected ? "#ffffff" : ENERGY_COLORS[level],
                      }}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold capitalize text-foreground">
                        {ENERGY_NAMES[level]}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {ENERGY_LABELS[level]} · {ENERGY_ACTIVITY_DESCRIPTIONS[level]}
                      </span>
                      <span
                        className="mt-0.5 block text-xs font-medium"
                        style={{ color: ENERGY_COLORS[level] }}
                      >
                        {effectiveRecommendedDuration(level, prefs)} min sugeridos
                      </span>
                    </span>
                    {isSelected && (
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ backgroundColor: ENERGY_COLORS[level] }}
                      >
                        <Check className="size-4" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isClient && (
              <p
                className="rounded-2xl px-4 py-3 text-center text-sm text-muted-foreground"
                style={{
                  backgroundColor: `${ENERGY_COLORS[energy]}14`,
                  borderColor: `${ENERGY_COLORS[energy]}40`,
                }}
              >
                Con energía {energy === "baja" ? "baja" : energy === "media" ? "media" : "alta"}{" "}
                te sugiero{" "}
                <span className="font-semibold" style={{ color: ENERGY_COLORS[energy] }}>
                  {suggested} min
                </span>{" "}
                · {effectiveMaxLabel(energy, prefs)}
              </p>
            )}

            <Button size="lg" onClick={handleConfirm} className="w-full">
              Ir a mi Home
            </Button>

            <button
              type="button"
              onClick={handleDismissToday}
              className="cursor-pointer self-center text-sm text-muted-foreground underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              !No mostrar más. Por Hoy!!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
