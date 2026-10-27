"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { MAX_MINUTES, MIN_MINUTES, parseDurationInput } from "@/lib/duration-parser";
import { cn } from "@/lib/utils";

const STEP = 5;

export function DurationPicker({
  chips,
  value,
  suggestedMinutes,
  onChange,
}: {
  chips: number[];
  value: number | null;
  suggestedMinutes?: number;
  onChange: (minutes: number) => void;
}) {
  const [draft, setDraft] = useState(value ? String(value) : "");
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value ? String(value) : "");
  }

  function commit(raw: string) {
    const parsed = parseDurationInput(raw);
    if (parsed === null) {
      setDraft(value ? String(value) : "");
      return;
    }
    onChange(parsed);
    setDraft(String(parsed));
  }

  function move(delta: number) {
    const base = value ?? MIN_MINUTES;
    const next = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, base + delta));
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {chips.map((minutes) => {
          const selected = value === minutes;
          const suggested = suggestedMinutes === minutes;
          return (
            <button
              key={minutes}
              type="button"
              onClick={() => onChange(minutes)}
              aria-pressed={selected}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border bg-surface px-2 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                selected
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : suggested
                    ? "border-accent-aprender bg-accent-aprender/5 ring-1 ring-accent-aprender"
                    : "border-border hover:border-foreground/40 hover:bg-surface-hover",
              )}
            >
              <span
                className={cn(
                  "text-xl font-bold tabular-nums",
                  selected
                    ? "text-background"
                    : suggested
                      ? "text-accent-aprender"
                      : "text-foreground",
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
              {selected ? (
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-background px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
                  <Check className="size-2.5" />
                  elegido
                </span>
              ) : suggested ? (
                <span className="mt-0.5 rounded-full bg-accent-aprender px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  recomendado
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Toca el número para escribir otro tiempo
        </p>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => move(-STEP)}
            disabled={(value ?? 0) <= MIN_MINUTES}
            aria-label="Reducir tiempo"
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>

          <label className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5">
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
                  setDraft(value ? String(value) : "");
                  event.currentTarget.blur();
                }
              }}
              onFocus={(event) => event.currentTarget.select()}
              inputMode="numeric"
              aria-label="Minutos de la sesión"
              className="w-24 min-w-0 bg-transparent text-center text-3xl font-bold tabular-nums text-foreground outline-none"
            />
            <span className="text-sm text-muted-foreground">min</span>
          </label>

          <button
            type="button"
            onClick={() => move(STEP)}
            disabled={(value ?? 0) >= MAX_MINUTES}
            aria-label="Aumentar tiempo"
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
