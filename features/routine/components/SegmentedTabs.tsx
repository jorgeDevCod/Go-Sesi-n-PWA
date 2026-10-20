"use client";

import { cn } from "@/lib/utils";

export type SegmentedTab<T extends string> = {
  key: T;
  label: string;
  hint?: string;
};

/**
 * Tabs compactas (pills) con el mismo lenguaje visual que las pestañas de
 * "Categorías · Actividades · Recomendaciones": la activa en negro.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  size = "sm",
}: {
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap items-center gap-2"
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex cursor-pointer flex-col items-center rounded-full border px-3.5 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
              size === "sm" ? "py-1.5 text-xs" : "py-2 text-sm",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-foreground hover:bg-surface-hover",
            )}
          >
            {tab.label}
            {tab.hint && (
              <span
                className={cn(
                  "text-[10px] font-normal",
                  active ? "text-background/70" : "text-muted-foreground",
                )}
              >
                {tab.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
