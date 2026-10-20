"use client";

import { cn } from "@/lib/utils";
import { pomodoroPlannedMinutes, type PomodoroConfig } from "@/services/session/pomodoro";

function MiniStepper({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
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
          className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-bold tabular-nums text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={disabled || value >= max}
          aria-label={`Aumentar ${label}`}
          className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

function MiniToggle({
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
 * Editor compacto de Pomodoro (foco, descanso, ciclos, descanso largo y
 * encadenado) con el resumen en una línea. Se usa en Personalizar →
 * Actividades (niveles y por actividad) para no duplicar UI.
 */
export function PomodoroCompactEditor({
  config,
  onChange,
  className,
  showLongBreak = true,
  showSkip = true,
}: {
  config: PomodoroConfig;
  onChange: (config: PomodoroConfig) => void;
  className?: string;
  showLongBreak?: boolean;
  showSkip?: boolean;
}) {
  const longBreakMin = config.longBreakMin ?? 0;
  const skipBreaks = config.skipBreaks ?? false;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="grid grid-cols-3 gap-2">
        <MiniStepper
          label="Foco"
          value={config.focusMin}
          min={5}
          max={120}
          step={5}
          onChange={(focusMin) => onChange({ ...config, focusMin })}
        />
        <MiniStepper
          label="Descanso"
          value={config.breakMin}
          min={0}
          max={30}
          step={5}
          disabled={skipBreaks}
          onChange={(breakMin) => onChange({ ...config, breakMin })}
        />
        <MiniStepper
          label="Ciclos"
          value={config.cycles}
          min={1}
          max={12}
          step={1}
          onChange={(cycles) => onChange({ ...config, cycles })}
        />
      </div>

      {(showLongBreak || showSkip) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {showLongBreak && (
            <MiniToggle
              label="Descanso largo al final"
              checked={longBreakMin > 0}
              onChange={(on) =>
                onChange({ ...config, longBreakMin: on ? Math.max(longBreakMin, 15) : 0 })
              }
            />
          )}
          {showSkip && (
            <MiniToggle
              label="Encadenar sin descansos"
              checked={skipBreaks}
              onChange={(value) => onChange({ ...config, skipBreaks: value })}
            />
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {config.cycles} {config.cycles === 1 ? "ciclo" : "ciclos"} · {config.focusMin} min foco ·{" "}
        {config.breakMin} min descanso · {pomodoroPlannedMinutes(config)} min en total
      </p>
    </div>
  );
}
