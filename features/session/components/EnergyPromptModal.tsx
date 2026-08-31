"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BatteryFull, BatteryLow, BatteryMedium } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ENERGY_LABELS,
  ENERGY_DESCRIPTIONS,
  ENERGY_COLORS,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";

const ENERGY_OPTIONS: { level: EnergyLevel; icon: typeof BatteryLow }[] = [
  { level: "baja", icon: BatteryLow },
  { level: "media", icon: BatteryMedium },
  { level: "alta", icon: BatteryFull },
];

export function EnergyPromptModal({
  open,
  onSelect,
  onSkip,
}: {
  open: boolean;
  onSelect: (energy: EnergyLevel) => void;
  onSkip: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onSkip();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onSkip]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="¿Cómo está tu energía hoy?"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                ¿Cómo está tu energía hoy?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Según tu nivel ordenaré las actividades para que elijas la que mejor encaje ahora.
                Puedes saltar si prefieres verlas todas.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {ENERGY_OPTIONS.map(({ level, icon: Icon }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSelect(level)}
                  className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-border bg-surface p-4 text-left transition-all duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${ENERGY_COLORS[level]}33` }}
                  >
                    <Icon className="size-5" style={{ color: ENERGY_COLORS[level] }} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium capitalize text-foreground">
                      {level === "baja" ? "Baja" : level === "media" ? "Media" : "Alta"}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {ENERGY_LABELS[level]}-{ENERGY_DESCRIPTIONS[level]}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onSkip}
              className={cn(
                "cursor-pointer self-center text-sm text-muted-foreground underline transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
              )}
            >
              Saltar y usar energía media
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
