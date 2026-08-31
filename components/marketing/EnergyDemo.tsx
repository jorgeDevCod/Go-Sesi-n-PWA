"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BatteryLow, Zap, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import {
  ENERGY_COLORS,
  ENERGY_LABELS,
  ENERGY_ACTIVITY_DESCRIPTIONS,
  effectiveRecommendedDuration,
  effectiveComplexityTargets,
  COMPLEXITY_LABELS,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";

const ENERGY_OPTIONS: { level: EnergyLevel; icon: typeof BatteryLow; label: string }[] = [
  { level: "baja", icon: BatteryLow, label: "Baja" },
  { level: "media", icon: Zap, label: "Media" },
  { level: "alta", icon: Rocket, label: "Alta" },
];

export function EnergyDemo() {
  const [energy, setEnergy] = useState<EnergyLevel>("media");

  const minutes = effectiveRecommendedDuration(energy);
  const targets = effectiveComplexityTargets(energy);
  const difficultyLabels = targets.map((c) => COMPLEXITY_LABELS[c]);
  const color = ENERGY_COLORS[energy];

  function handleSelect(level: EnergyLevel) {
    setEnergy(level);
    track("energy_demo_select", { energy: level });
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6 text-left">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Pruébalo ahora
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige tu energía y mira cómo Go ajusta tu sesión al instante.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ENERGY_OPTIONS.map(({ level, icon: Icon, label }) => {
          const active = energy === level;
          const c = ENERGY_COLORS[level];
          return (
            <button
              key={level}
              type="button"
              onClick={() => handleSelect(level)}
              aria-pressed={active}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 bg-surface px-3 py-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                active ? "shadow-sm" : "border-border text-foreground hover:bg-surface-hover",
              )}
              style={active ? { borderColor: `${c}55`, color: c } : undefined}
            >
              <Icon className="size-6" style={{ color: active ? c : "var(--color-muted-foreground)" }} />
              <span className="text-sm font-semibold">{label}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={energy}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-2 rounded-2xl p-4"
        style={{ backgroundColor: `${color}14` }}
      >
        <p className="text-sm font-medium text-foreground">{ENERGY_LABELS[energy]}</p>
        <p className="text-xs text-muted-foreground">{ENERGY_ACTIVITY_DESCRIPTIONS[energy]}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-sm font-bold text-white"
            style={{ backgroundColor: color }}
          >
            ~{minutes} min
          </span>
          <span className="text-xs text-muted-foreground">
            De <data value=""></data>ificultad: {difficultyLabels.join(" o ")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
