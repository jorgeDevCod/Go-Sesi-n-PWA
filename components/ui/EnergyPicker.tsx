"use client";

import { BatteryFull, BatteryLow, BatteryMedium } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ENERGY_COLORS,
  ENERGY_TEXT,
  ENERGY_TINT,
  ENERGY_TINT_HOVER,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";

const ENERGY_LEVELS: {
  level: EnergyLevel;
  icon: typeof BatteryLow;
  label: string;
  hint: string;
}[] = [
  { level: "baja", icon: BatteryLow, label: "Baja", hint: "Poca energía" },
  { level: "media", icon: BatteryMedium, label: "Media", hint: "Equilibrado" },
  { level: "alta", icon: BatteryFull, label: "Alta", hint: "Mucha energía" },
];

export function EnergyPicker({
  value,
  onChange,
  size = "md",
}: {
  value: EnergyLevel | null;
  onChange: (value: EnergyLevel) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn("grid grid-cols-3", size === "sm" ? "gap-2" : "gap-2.5")}
      role="radiogroup"
      aria-label="Energía"
    >
      {ENERGY_LEVELS.map(({ level, icon: Icon, label, hint }) => {
        const selected = value === level;
        const color = ENERGY_COLORS[level];
        const onColor = ENERGY_TEXT[level];
        const textOnEnergy = selected ? onColor : "var(--color-foreground)";
        const textOnEnergyMuted = selected
          ? "rgba(255,255,255,0.92)"
          : "var(--color-muted-foreground)";
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(level)}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 font-work transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
              size === "sm" ? "gap-0 px-2 py-2.5" : "gap-1 px-3 py-3",
              selected
                ? "border-transparent text-white shadow-md"
                : "border-border bg-surface text-foreground hover:bg-[var(--energy-hover)] hover:border-[var(--energy-tint)] hover:shadow-sm",
            )}
            style={{
              ...(selected
                ? { backgroundColor: color, borderColor: color }
                : { "--energy-tint": ENERGY_TINT[level], "--energy-hover": ENERGY_TINT_HOVER[level] } as React.CSSProperties),
            }}
          >
            <Icon
              className={cn("shrink-0", size === "sm" ? "size-4" : "size-5")}
              style={{ color: selected ? textOnEnergy : color }}
              strokeWidth={2.2}
            />
            <span
              className={cn(
                "font-semibold leading-tight",
                size === "sm" ? "text-[13px]" : "text-sm",
              )}
              style={{ color: selected ? textOnEnergy : "var(--color-foreground)" }}
            >
              {label}
            </span>
            <span
              className={cn(
                "leading-tight",
                size === "sm" ? "text-[10px]" : "text-xs",
              )}
              style={{ color: selected ? textOnEnergyMuted : "var(--color-muted-foreground)" }}
            >
              {hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
