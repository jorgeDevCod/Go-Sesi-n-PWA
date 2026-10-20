"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PomodoroConfigurator } from "@/features/session/components/PomodoroConfigurator";
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

const TIER_TO_ENERGY: Record<PomodoroTier, EnergyLevel> = {
  ligero: "baja",
  medio: "media",
  intenso: "alta",
};

function ClassicTimeEditor({
  energy,
}: {
  energy: EnergyLevel;
}) {
  const prefs = useRecommendationPrefs();
  const min = effectiveEnergyMin(energy, prefs);
  const rec = effectiveRecommendedDuration(energy, prefs);
  const max = effectiveEnergyMax(energy, prefs);

  function setValue(kind: "min" | "rec" | "max", value: number) {
    if (kind === "min") prefs.setEnergyMinDuration(energy, value);
    if (kind === "rec") prefs.setEnergyDuration(energy, value);
    if (kind === "max") prefs.setEnergyMaxDuration(energy, value);
  }

  const fields = [
    { key: "min" as const, label: "Mínimo (min)", value: min },
    { key: "rec" as const, label: "Recomendado (min)", value: rec },
    { key: "max" as const, label: "Máximo (min)", value: max },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">Tiempos clásicos</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        El tiempo recomendado es el que aparece por defecto al iniciar una sesión sin Pomodoro.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {field.label}
            </span>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-1 py-0.5">
              <button
                type="button"
                onClick={() => setValue(field.key, Math.max(1, field.value - 5))}
                aria-label={`Reducir ${field.label}`}
                className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                −
              </button>
              <span className="w-9 text-center text-sm font-bold tabular-nums text-foreground">
                {field.value}
              </span>
              <button
                type="button"
                onClick={() => setValue(field.key, field.value + 5)}
                aria-label={`Aumentar ${field.label}`}
                className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Tabs por nivel (Ligero / Medio / Intenso) para ajustar los tiempos
 * pre-programados que se ofrecen al elegir Pomodoro o Clásico.
 */
export function RoutineTimePresets() {
  const prefs = useRecommendationPrefs();
  const [tier, setTier] = useState<PomodoroTier>("medio");
  const config = pomodoroPresetFor(tier, prefs.pomodoroPresets);
  const isCustom = Boolean(prefs.pomodoroPresets[tier]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">Tiempos pre-programados</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ajusta los tres niveles que se ofrecen al iniciar una sesión: sus tiempos de foco,
          descansos y repeticiones.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Nivel de tiempos">
        {POMODORO_TIERS.map((key) => {
          const active = tier === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTier(key)}
              aria-pressed={active}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                active
                  ? "border-accent-aprender/40 bg-accent-aprender/15 text-accent-aprender"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              {POMODORO_TIER_LABELS[key]}
              <span className="text-[11px] font-normal opacity-80">
                {POMODORO_TIER_DETAILS[key]}
              </span>
            </button>
          );
        })}
      </div>

      <ClassicTimeEditor energy={TIER_TO_ENERGY[tier]} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Pomodoro de {POMODORO_TIER_LABELS[tier].toLowerCase()}</p>
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
        <PomodoroConfigurator
          config={config}
          onChange={(next) => prefs.setPomodoroPreset(tier, next)}
        />
      </div>
    </div>
  );
}
