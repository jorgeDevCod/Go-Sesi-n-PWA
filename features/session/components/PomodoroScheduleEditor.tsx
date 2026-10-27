"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  describePomodoroPlan,
  type PomodoroConfig,
  type PomodoroTier,
} from "@/services/session/pomodoro";

type PresetOption = {
  key: PomodoroTier;
  label: string;
  detail: string;
  config: PomodoroConfig;
};

function samePlan(a: PomodoroConfig, b: PomodoroConfig) {
  return (
    a.focusMin === b.focusMin &&
    a.breakMin === b.breakMin &&
    a.cycles === b.cycles &&
    (a.longBreakMin ?? 0) === (b.longBreakMin ?? 0) &&
    (a.skipBreaks ?? false) === (b.skipBreaks ?? false)
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    setDraft(String(value));
  }

  function commit(raw: string) {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = Math.min(max, Math.max(min, parsed));
    onChange(next);
    setDraft(String(next));
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-1 py-0.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={disabled || value <= min}
          aria-label={`Reducir ${label}`}
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(draft);
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              setDraft(String(value));
              event.currentTarget.blur();
            }
          }}
          onFocus={(event) => event.currentTarget.select()}
          inputMode="numeric"
          disabled={disabled}
          aria-label={label}
          className="w-10 bg-transparent text-center text-sm font-bold tabular-nums text-foreground outline-none disabled:opacity-40"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={disabled || value >= max}
          aria-label={`Aumentar ${label}`}
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-left text-xs font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
    >
      <span
        className={cn(
          "flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
          checked ? "bg-accent-aprender" : "bg-border",
        )}
      >
        <span
          className={cn(
            "size-3 rounded-full bg-white transition-transform duration-200",
            checked ? "translate-x-3" : "translate-x-0",
          )}
        />
      </span>
      {label}
    </button>
  );
}

/**
 * Editor del cronómetro Pomodoro de la vista de inicio. Los presets son
 * puntos de partida; foco, descanso y ciclos se pueden editar directamente.
 */
export function PomodoroScheduleEditor({
  config,
  presets,
  recommendedTier,
  onChange,
  onSelectPreset,
}: {
  config: PomodoroConfig;
  presets: PresetOption[];
  recommendedTier: PomodoroTier;
  onChange: (config: PomodoroConfig) => void;
  onSelectPreset: (tier: PomodoroTier) => void;
}) {
  const longBreakMin = config.longBreakMin ?? 0;
  const skipBreaks = config.skipBreaks ?? false;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => {
          const selected = samePlan(config, preset.config);
          const recommended = preset.key === recommendedTier;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => onSelectPreset(preset.key)}
              aria-pressed={selected}
              className={cn(
                "flex cursor-pointer flex-col gap-0.5 rounded-xl border px-2 py-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                selected
                  ? "border-accent-aprender bg-accent-aprender/10"
                  : "border-border bg-surface hover:bg-surface-hover",
              )}
            >
              <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                {preset.label}
                {selected && <Check className="size-3 text-accent-aprender" />}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {preset.config.focusMin}/{preset.config.breakMin} · {preset.config.cycles}c
              </span>
              {recommended && (
                <span className="mt-0.5 rounded-full bg-accent-aprender px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  recomendado
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Programación
          </p>
          <span className="text-[10px] text-muted-foreground">
            Toca los números para ajustar
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label="Foco"
            value={config.focusMin}
            min={5}
            max={180}
            step={5}
            onChange={(focusMin) => onChange({ ...config, focusMin })}
          />
          <NumberField
            label="Descanso"
            value={config.breakMin}
            min={0}
            max={60}
            step={5}
            disabled={skipBreaks}
            onChange={(breakMin) => onChange({ ...config, breakMin })}
          />
          <NumberField
            label="Ciclos"
            value={config.cycles}
            min={1}
            max={12}
            step={1}
            onChange={(cycles) => onChange({ ...config, cycles })}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Toggle
            label="Descanso largo al final"
            checked={longBreakMin > 0}
            onChange={(on) =>
              onChange({ ...config, longBreakMin: on ? Math.max(longBreakMin, 15) : 0 })
            }
          />
          <Toggle
            label="Encadenar sin descansos"
            checked={skipBreaks}
            onChange={(value) => onChange({ ...config, skipBreaks: value })}
          />
        </div>

        <p className="text-xs text-muted-foreground">{describePomodoroPlan(config)}</p>
      </div>
    </div>
  );
}
