"use client";

import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

const DIFFICULTY_OPTIONS: { value: Complexity; label: string }[] = [
  { value: "LOW", label: COMPLEXITY_LABELS.LOW },
  { value: "MEDIUM", label: COMPLEXITY_LABELS.MEDIUM },
  { value: "HIGH", label: COMPLEXITY_LABELS.HIGH },
];

/**
 * Filtro de dificultad: una sola sección tipo pestañas, al ancho del
 * contenido. Seleccionar "Todas" limpia el filtro.
 */
export function ActivityFilters({
  selectedDifficulties,
  onToggleDifficulty,
}: {
  selectedDifficulties: Complexity[];
  onToggleDifficulty: (value: Complexity) => void;
}) {
  const allActive = selectedDifficulties.length === 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent-aprender/10">
          <Gauge className="size-4 text-accent-aprender" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Filtrar por dificultad</p>
          <p className="text-xs text-muted-foreground">
            Muestra solo las actividades del nivel que elijas.
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Filtrar por dificultad"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          onClick={() => selectedDifficulties.forEach((value) => onToggleDifficulty(value))}
          aria-pressed={allActive}
          className={cn(
            "cursor-pointer rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
            allActive
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface text-foreground hover:bg-surface-hover",
          )}
        >
          Todas
        </button>
        {DIFFICULTY_OPTIONS.map(({ value, label }) => {
          const selected = selectedDifficulties.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggleDifficulty(value)}
              aria-pressed={selected}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
