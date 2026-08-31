"use client";

import { cn } from "@/lib/utils";
import type { Complexity } from "@/lib/constants/default-subcategories";

const COMPLEXITY_LEVELS: Complexity[] = ["LOW", "MEDIUM", "HIGH"];

const LABELS: Record<Complexity, string> = {
  LOW: "Ligera",
  MEDIUM: "Moderada",
  HIGH: "Intensa",
};

const HINTS: Record<Complexity, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export function DifficultyPicker({
  value,
  onChange,
  size = "md",
}: {
  value: Complexity;
  onChange: (value: Complexity) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", size === "sm" && "gap-1")} role="radiogroup" aria-label="Dificultad">
      {COMPLEXITY_LEVELS.map((level) => {
        const selected = value === level;
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(level)}
            className={cn(
              "flex cursor-pointer flex-col items-center rounded-xl border-2 font-work transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
              size === "sm" ? "gap-0 px-2 py-2" : "gap-0.5 px-3 py-2.5",
              selected
                ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                : "border-border bg-surface text-foreground hover:bg-surface-hover",
            )}
          >
            <span className={cn("font-semibold", size === "sm" ? "text-xs" : "text-sm")}>
              {LABELS[level]}
            </span>
            <span className={cn("text-muted-foreground", size === "sm" ? "text-[10px]" : "text-xs")}>
              {HINTS[level]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
