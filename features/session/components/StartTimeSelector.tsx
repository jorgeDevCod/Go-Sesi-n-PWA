"use client";

import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function StartTimeSelector({
  chips,
  value,
  suggestedMinutes,
  onSelect,
  onEdit,
}: {
  chips: number[];
  value: number | null;
  suggestedMinutes?: number;
  onSelect: (minutes: number) => void;
  onEdit: (minutes: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
        {chips.map((minutes) => {
          const selected = value === minutes;
          const suggested = suggestedMinutes === minutes;
          return (
            <button
              key={minutes}
              type="button"
              onClick={() => onSelect(minutes)}
              aria-pressed={selected}
              aria-label={`Elegir ${minutes} minutos`}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border bg-surface px-2 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                selected
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border hover:border-foreground/40 hover:bg-surface-hover",
              )}
            >
              {suggested && (
                <span className="absolute -top-2 right-1.5 rounded-full bg-accent-aprender px-1.5 py-0.5 text-[8px] font-semibold leading-none text-white shadow-sm">
                  Recomendado
                </span>
              )}
              <span
                className={cn(
                  "text-xl font-bold tabular-nums",
                  selected ? "text-background" : "text-foreground",
                )}
              >
                {minutes}
              </span>
              <span
                className={cn(
                  "text-[10px]",
                  selected ? "text-background/70" : "text-muted-foreground",
                )}
              >
                min
              </span>
              {selected && (
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-background px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
                  <Check className="size-2.5" />
                  elegido
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => value && onEdit(value)}
        disabled={!value}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted p-4 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tiempo elegido
          </span>
          <span className="mt-0.5 flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {value ?? "—"}
            </span>
            <span className="text-sm text-muted-foreground">min</span>
          </span>
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground">
          <Pencil className="size-3.5" />
          Ajustar
        </span>
      </button>
    </div>
  );
}
