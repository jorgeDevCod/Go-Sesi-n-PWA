"use client";

import { useState } from "react";
import { BatteryFull, BatteryLow, BatteryMedium, Check, ChevronDown, Gauge, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { COMPLEXITY_LABELS, ENERGY_COLORS, type EnergyLevel } from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

const ENERGY_OPTIONS: { level: EnergyLevel; label: string; icon: typeof BatteryLow }[] = [
  { level: "baja", label: "Baja", icon: BatteryLow },
  { level: "media", label: "Media", icon: BatteryMedium },
  { level: "alta", label: "Alta", icon: BatteryFull },
];

const DIFFICULTY_OPTIONS: { value: Complexity; label: string }[] = [
  { value: "LOW", label: COMPLEXITY_LABELS.LOW },
  { value: "MEDIUM", label: COMPLEXITY_LABELS.MEDIUM },
  { value: "HIGH", label: COMPLEXITY_LABELS.HIGH },
];

function SectionCollapsible({
  open,
  onToggle,
  icon: Icon,
  title,
  activeCount,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  icon: typeof Gauge;
  title: string;
  activeCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-muted">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-aprender/10">
          <Icon className="size-4 text-accent-aprender" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
          {title}
        </span>
        {activeCount > 0 && (
          <span className="shrink-0 rounded-full bg-accent-aprender px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {activeCount}
          </span>
        )}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 border-t border-border p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ActivityFilters({
  selectedEnergies,
  selectedDifficulties,
  onToggleEnergy,
  onToggleDifficulty,
}: {
  selectedEnergies: EnergyLevel[];
  selectedDifficulties: Complexity[];
  onToggleEnergy: (level: EnergyLevel) => void;
  onToggleDifficulty: (value: Complexity) => void;
}) {
  const [openDifficulty, setOpenDifficulty] = useState(false);
  const [openEnergy, setOpenEnergy] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent-aprender/10">
          <SlidersHorizontal className="size-4 text-accent-aprender" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Filtrar actividades
          </p>
          <p className="text-xs text-muted-foreground">
            Encuentra la indicada por energía y dificultad.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SectionCollapsible
          open={openDifficulty}
          onToggle={() => setOpenDifficulty((v) => !v)}
          icon={Gauge}
          title="Dificultad"
          activeCount={selectedDifficulties.length}
        >
          {DIFFICULTY_OPTIONS.map(({ value, label }) => {
            const selected = selectedDifficulties.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => onToggleDifficulty(value)}
                aria-pressed={selected}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                  selected
                    ? "border-accent-aprender bg-accent-aprender text-white shadow-sm"
                    : "border-border bg-background text-foreground hover:border-accent-aprender/40 hover:bg-surface-hover",
                )}
              >
                {selected && <Check className="size-3.5" />}
                {label}
              </button>
            );
          })}
        </SectionCollapsible>

        <SectionCollapsible
          open={openEnergy}
          onToggle={() => setOpenEnergy((v) => !v)}
          icon={BatteryMedium}
          title="Estado de ánimo / energía"
          activeCount={selectedEnergies.length}
        >
          {ENERGY_OPTIONS.map(({ level, label, icon: Icon }) => {
            const selected = selectedEnergies.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => onToggleEnergy(level)}
                aria-pressed={selected}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                  selected
                    ? "border-transparent text-white shadow-sm"
                    : "border-border bg-background text-foreground hover:bg-surface-hover",
                )}
                style={
                  selected
                    ? { backgroundColor: ENERGY_COLORS[level], borderColor: ENERGY_COLORS[level] }
                    : undefined
                }
              >
                {selected ? <Check className="size-3.5" /> : <Icon className="size-4" />}
                {label}
              </button>
            );
          })}
        </SectionCollapsible>
      </div>
    </div>
  );
}
