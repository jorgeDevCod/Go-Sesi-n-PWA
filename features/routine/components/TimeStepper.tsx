"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stepper compacto para ajustar un tiempo (Mín / Rec / Máx) en minutos.
 * - `value` es el valor efectivo mostrado; si es `null` se muestra "—".
 * - `isCustom` indica si el usuario personalizó (muestra botón de restablecer)
 *   o si se usa el valor por defecto (badge "def.").
 * - El reset/badge va a nivel del stepper, no interrumpe el título.
 */
export function TimeStepper({
  label,
  value,
  isCustom,
  min = 5,
  max = 240,
  step = 5,
  accent,
  onChange,
  onClear,
}: {
  label: string;
  value: number | null;
  isCustom: boolean;
  min?: number;
  max?: number;
  step?: number;
  accent?: string;
  onChange: (value: number) => void;
  onClear: () => void;
}) {
  const shown = value;

  function move(delta: number) {
    const base = value ?? 25;
    const next = Math.min(Math.max(base + delta, min), max);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div
        className="flex items-center justify-between rounded-xl border bg-surface-muted px-1 py-0.5"
        style={accent && isCustom ? { borderColor: `${accent}66` } : undefined}
      >
        <button
          type="button"
          onClick={() => move(-step)}
          aria-label={`Reducir ${label}`}
          className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          <Minus className="size-3" />
        </button>
        <span
          className={cn(
            "w-9 text-center text-sm font-bold tabular-nums",
            shown === null ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {shown === null ? "—" : shown}
        </span>
        <button
          type="button"
          onClick={() => move(step)}
          aria-label={`Aumentar ${label}`}
          className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          <Plus className="size-3" />
        </button>
        <span className="flex size-5 items-center justify-center">
          {isCustom ? (
            <button
              type="button"
              onClick={onClear}
              aria-label={`Restablecer ${label}`}
              title="Restablecer a lo recomendado"
              className="flex size-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <RotateCcw className="size-2.5" />
            </button>
          ) : (
            <span className="rounded-full bg-surface-hover px-1 py-px text-[8px] font-semibold leading-none text-muted-foreground">
              def.
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
