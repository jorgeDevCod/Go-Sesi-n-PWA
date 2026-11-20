"use client";

import { useId, useState } from "react";
import { ChevronDown, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

const DIFFICULTY_OPTIONS: { value: Complexity; label: string }[] = [
  { value: "LOW", label: COMPLEXITY_LABELS.LOW },
  { value: "MEDIUM", label: COMPLEXITY_LABELS.MEDIUM },
  { value: "HIGH", label: COMPLEXITY_LABELS.HIGH },
];

/**
 * Filtro de dificultad en un desplegable cerrado por defecto. Seleccionar
 * "Todas" limpia el filtro.
 */
export function ActivityFilters({
  selectedDifficulties,
  onToggleDifficulty,
}: {
  selectedDifficulties: Complexity[];
  onToggleDifficulty: (value: Complexity) => void;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const allActive = selectedDifficulties.length === 0;
  const selectedLabel =
    selectedDifficulties.length === 0
      ? "Todas las actividades"
      : DIFFICULTY_OPTIONS.filter(({ value }) =>
          selectedDifficulties.includes(value),
        )
          .map(({ label }) => label)
          .join(", ");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={contentId}
        aria-label="Filtrar por dificultades"
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-aprender"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-aprender/10">
          <Gauge className="size-4 text-accent-aprender" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            Filtrar por dificultades
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {selectedLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={contentId}
          role="group"
          aria-label="Filtrar por dificultad"
          className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3"
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
            Todas las actividades
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
      )}
    </div>
  );
}
