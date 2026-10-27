"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { describePomodoroPlan, type PomodoroConfig } from "@/services/session/pomodoro";

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
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-1 py-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={disabled || value <= min}
          aria-label={`Reducir ${label}`}
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="size-4" />
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
          className="w-12 bg-transparent text-center text-base font-bold tabular-nums text-foreground outline-none disabled:opacity-40"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={disabled || value >= max}
          aria-label={`Aumentar ${label}`}
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-4" />
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
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-xs font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
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

/** Campos editables del Pomodoro. Los presets se eligen fuera, en la vista. */
export function PomodoroScheduleEditor({
  config,
  onChange,
}: {
  config: PomodoroConfig;
  onChange: (config: PomodoroConfig) => void;
}) {
  const longBreakMin = config.longBreakMin ?? 0;
  const skipBreaks = config.skipBreaks ?? false;

  return (
    <div className="flex flex-col gap-4">
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
  );
}
