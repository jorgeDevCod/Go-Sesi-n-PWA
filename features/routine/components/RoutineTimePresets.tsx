"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { PomodoroCompactEditor } from "@/features/routine/components/PomodoroCompactEditor";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import {
  POMODORO_TIER_DETAILS,
  POMODORO_TIER_LABELS,
  POMODORO_TIERS,
  pomodoroPresetFor,
  type PomodoroTier,
} from "@/services/session/pomodoro";
import {
  effectiveEnergyMax,
  effectiveEnergyMin,
  effectiveRecommendedDuration,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";
import { cn } from "@/lib/utils";

const TIER_TO_ENERGY: Record<PomodoroTier, EnergyLevel> = {
  ligero: "baja",
  medio: "media",
  intenso: "alta",
};

function MiniNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
        {value} min
      </span>
      <span className="flex gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 5))}
          aria-label={`Reducir ${label}`}
          className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onChange(value + 5)}
          aria-label={`Aumentar ${label}`}
          className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          +
        </button>
      </span>
    </div>
  );
}

/**
 * Tiempos pre-programados por nivel (Ligero / Medio / Intenso): la sesión
 * clásica y el pomodoro del nivel, visibles a la vez en dos columnas.
 */
export function RoutineTimePresets() {
  const prefs = useRecommendationPrefs();
  const [tier, setTier] = useState<PomodoroTier>("medio");
  const energy = TIER_TO_ENERGY[tier];
  const config = pomodoroPresetFor(tier, prefs.pomodoroPresets);
  const isCustom = Boolean(prefs.pomodoroPresets[tier]);

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-aprender">
            <Sparkles className="size-3" />
            A tu medida
          </p>
          <h2 className="font-display mt-1 text-xl font-bold text-foreground sm:text-2xl">
            Tiempos pre-programados
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Elige un nivel y ajusta la sesión clásica y el pomodoro en un mismo vistazo.
          </p>
        </div>
        {isCustom && (
          <button
            type="button"
            onClick={() => prefs.removePomodoroPreset(tier)}
            className="cursor-pointer text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            Restablecer
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label="Nivel de tiempos"
        className="grid grid-cols-3 gap-2"
      >
        {POMODORO_TIERS.map((key) => {
          const active = tier === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTier(key)}
              aria-pressed={active}
              className={cn(
                "flex cursor-pointer flex-col items-center rounded-xl border px-2 py-2 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                active
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              <span className="text-sm">{POMODORO_TIER_LABELS[key]}</span>
              <span
                className={cn(
                  "text-[10px] font-normal",
                  active ? "text-background/70" : "text-muted-foreground",
                )}
              >
                {POMODORO_TIER_DETAILS[key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-muted p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sesión clásica
          </p>
          <MiniNumber
            label="Mínimo"
            value={effectiveEnergyMin(energy, prefs)}
            onChange={(v) => prefs.setEnergyMinDuration(energy, v)}
          />
          <MiniNumber
            label="Recomendado"
            value={effectiveRecommendedDuration(energy, prefs)}
            onChange={(v) => prefs.setEnergyDuration(energy, v)}
          />
          <MiniNumber
            label="Máximo"
            value={effectiveEnergyMax(energy, prefs)}
            onChange={(v) => prefs.setEnergyMaxDuration(energy, v)}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-muted p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pomodoro
          </p>
          <PomodoroCompactEditor
            config={config}
            onChange={(next) => prefs.setPomodoroPreset(tier, next)}
          />
        </div>
      </div>
    </section>
  );
}
