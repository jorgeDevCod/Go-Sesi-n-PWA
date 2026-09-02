"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnergyPicker } from "@/components/ui/EnergyPicker";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import { markMoodAnsweredToday } from "@/features/recommendation/mood.storage";
import {
  ENERGY_COLORS,
  ENERGY_LABELS,
  effectiveRecommendedDuration,
  effectiveMaxLabel,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";

function subscribeNoop() {
  return () => {};
}

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
  const energyLabel = ENERGY_LABELS[energy];
  const maxLabel = effectiveMaxLabel(energy, prefs);

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
            className="flex max-h-[92vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender">
                <PartyPopper className="size-5" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                ¿Cómo te sientes hoy, {userName}?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Con tu ánimo ajustamos las actividades y tiempos para hoy.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-display text-sm font-semibold text-foreground">Elige tu energía</p>
              <EnergyPicker value={energy} onChange={setEnergy} />
            </div>

            {isClient && (
              <p
                className="rounded-2xl px-4 py-3 text-center text-sm text-muted-foreground"
                style={{
                  backgroundColor: `${ENERGY_COLORS[energy]}14`,
                  borderColor: `${ENERGY_COLORS[energy]}40`,
                }}
              >
                {energyLabel} →{" "}
                <span className="font-semibold" style={{ color: ENERGY_COLORS[energy] }}>
                  {suggested} min
                </span>{" "}
                · {maxLabel}
              </p>
            )}

            <Button size="lg" onClick={handleConfirm} className="w-full">
              Ir a mi espacio
            </Button>

            <button
              type="button"
              onClick={handleDismissToday}
              className="cursor-pointer self-center text-sm text-muted-foreground underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              No mostrar más hoy
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
