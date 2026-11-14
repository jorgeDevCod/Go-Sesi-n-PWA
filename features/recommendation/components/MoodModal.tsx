"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EnergyPicker } from "@/components/ui/EnergyPicker";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import { suppressMoodPromptToday } from "@/features/recommendation/mood.storage";
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
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  if (typeof document === "undefined") return null;

  const suggested = effectiveRecommendedDuration(energy, prefs);
  const energyLabel = ENERGY_LABELS[energy];
  const maxLabel = effectiveMaxLabel(energy, prefs);

  function handleClose() {
    setDontShowAgain(false);
    onClose();
  }

  function handleConfirm() {
    prefs.setEnergy(energy);
    prefs.setPreferredMinutes(suggested);
    if (dontShowAgain) suppressMoodPromptToday();
    handleClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/25 p-3 backdrop-blur-[2px] sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="¿Cómo te sientes hoy?"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex max-h-[92vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-3xl border border-border bg-surface p-5 shadow-xl"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className="absolute top-3.5 right-3.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  ¿Cómo estás hoy, {userName}?
                </h2>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  Con tu energía ajustamos las sugerencias. Puedes cambiarla cuando quieras.
                </p>
              </div>
            </div>

            <EnergyPicker value={energy} onChange={setEnergy} />

            {isClient && (
              <p
                className="rounded-2xl px-4 py-2.5 text-center text-sm text-muted-foreground"
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

            <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl bg-surface-muted px-3.5 py-3 text-left text-xs text-foreground">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(event) => setDontShowAgain(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--accent-aprender)]"
              />
              <span>
                <span className="font-medium">No volver a mostrar hoy</span>
                <span className="mt-0.5 block text-muted-foreground">
                  {dontShowAgain
                    ? "No aparecerá hasta mañana."
                    : "Si no lo marcas, volverá en la próxima apertura."}
                </span>
              </span>
            </label>

            <div className="flex flex-col gap-2">
              <Button size="lg" onClick={handleConfirm} className="w-full">
                Guardar y continuar
              </Button>
              <Button variant="ghost" onClick={handleClose} className="w-full">
                Ahora no
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
