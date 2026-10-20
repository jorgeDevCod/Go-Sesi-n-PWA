"use client";

import { cn } from "@/lib/utils";
import { describePomodoroPlan, type PomodoroConfig } from "@/services/session/pomodoro";

function Stepper({
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
  function move(delta: number) {
    onChange(Math.min(Math.max(value + delta, min), max));
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-1 py-0.5">
        <button
          type="button"
          onClick={() => move(-step)}
          disabled={disabled || value <= min}
          aria-label={`Reducir ${label}`}
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="w-9 text-center text-sm font-bold tabular-nums text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={() => move(step)}
          disabled={disabled || value >= max}
          aria-label={`Aumentar ${label}`}
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors duration-200 hover:bg-surface-hover">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--accent-aprender)]"
      />
      <span className="flex flex-col gap-0.5 text-left">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="text-xs leading-relaxed text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * Configurador del cronómetro Pomodoro. Se usa en dos sitios (la vista de
 * tiempos antes de empezar y Personalizar → Actividades) para que el patrón
 * visual y el vocabulario sean los mismos.
 */
export function PomodoroConfigurator({
  config,
  onChange,
  onReset,
  resetLabel = "Restablecer",
  showReset = false,
  className,
}: {
  config: PomodoroConfig;
  onChange: (config: PomodoroConfig) => void;
  onReset?: () => void;
  resetLabel?: string;
  showReset?: boolean;
  className?: string;
}) {
  const longBreakMin = config.longBreakMin ?? 0;
  const skipBreaks = config.skipBreaks ?? false;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stepper
          label="Foco (min)"
          value={config.focusMin}
          min={5}
          max={120}
          step={5}
          onChange={(focusMin) => onChange({ ...config, focusMin })}
        />
        <Stepper
          label="Descanso (min)"
          value={config.breakMin}
          min={0}
          max={30}
          step={5}
          disabled={skipBreaks}
          onChange={(breakMin) => onChange({ ...config, breakMin })}
        />
        <Stepper
          label="Ciclos"
          value={config.cycles}
          min={1}
          max={12}
          step={1}
          onChange={(cycles) => onChange({ ...config, cycles })}
        />
        <Stepper
          label="Descanso largo (min)"
          value={longBreakMin}
          min={0}
          max={60}
          step={5}
          disabled={longBreakMin === 0}
          onChange={(value) => onChange({ ...config, longBreakMin: value })}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Toggle
          label="Descanso largo al final"
          hint="Tras el último ciclo, un descanso más largo antes de cerrar la sesión."
          checked={longBreakMin > 0}
          onChange={(value) =>
            onChange({ ...config, longBreakMin: value ? Math.max(longBreakMin, 15) : 0 })
          }
        />
        <Toggle
          label="Encadenar ciclos sin descansos"
          hint="Solo tiempo de concentración, uno tras otro."
          checked={skipBreaks}
          onChange={(value) => onChange({ ...config, skipBreaks: value })}
        />
        <Toggle
          label="Avanzar fases automáticamente"
          hint="Si lo apagas, te avisamos y esperas tu confirmación para el descanso."
          checked={config.autoStart}
          onChange={(value) => onChange({ ...config, autoStart: value })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-accent-aprender/5 px-4 py-3">
        <p className="text-xs leading-relaxed text-accent-aprender">
          {describePomodoroPlan(config)}
        </p>
        {showReset && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </div>
  );
}
