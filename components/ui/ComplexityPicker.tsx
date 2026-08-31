"use client";

import type { Complexity } from "@/lib/constants/default-subcategories";
import { cn } from "@/lib/utils";

const COMPLEXITY_OPTIONS: { value: Complexity; label: string; hint: string }[] = [
  { value: "LOW", label: "Baja", hint: "Ligera" },
  { value: "MEDIUM", label: "Media", hint: "Moderada" },
  { value: "HIGH", label: "Alta", hint: "Intensa" },
];

export function ComplexityPicker({
  value,
  onChange,
  hint,
}: {
  value: Complexity;
  onChange: (complexity: Complexity) => void;
  hint?: string;
}) {
  return (
    <div>
      {hint && <p className="mb-2 text-xs text-muted-foreground">{hint}</p>}
      <div className="grid grid-cols-3 gap-2">
        {COMPLEXITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 font-work transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
              value === option.value
                ? "border-accent-aprender bg-accent-aprender/5 ring-1 ring-accent-aprender"
                : "border-border bg-surface-muted hover:bg-surface-hover",
            )}
          >
            <span
              className={cn(
                "text-sm font-semibold",
                value === option.value ? "text-accent-aprender" : "text-foreground",
              )}
            >
              {option.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{option.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
