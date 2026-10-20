"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/features/routine/components/SegmentedTabs";
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
      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
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
 * Tiempos pre-programados por nivel (Ligero / Medio / Intenso): los tiempos
 * de sesión clásica y el pomodoro del nivel, en una sola tarjeta compacta.
 */
export function RoutineTimePresets() {
  const prefs = useRecommendationPrefs();
  const [tier, setTier] = useState<PomodoroTier>("medio");
  const energy = TIER_TO_ENERGY[tier];
  const config = pomodoroPresetFor(tier, prefs.pomodoroPresets);
  const isCustom = Boolean(prefs.pomodoroPresets[tier]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Tiempos pre-programados</p>
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

      <SegmentedTabs
        ariaLabel="Nivel de tiempos"
        value={tier}
        onChange={setTier}
        tabs={POMODORO_TIERS.map((key) => ({
          key,
          label: POMODORO_TIER_LABELS[key],
          hint: POMODORO_TIER_DETAILS[key],
        }))}
      />

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted p-3">
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

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pomodoro
        </p>
        <PomodoroCompactEditor
          config={config}
          onChange={(next) => prefs.setPomodoroPreset(tier, next)}
        />
      </div>
    </div>
  );
}
