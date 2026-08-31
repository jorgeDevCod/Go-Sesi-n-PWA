"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const HOURS = [0, 1, 2, 3, 4];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function DurationPicker({
  chips,
  chipPrefix = "",
  suggestedMinutes,
  defaultMinutes,
  maxLabel,
  onSelect,
}: {
  chips: number[];
  chipPrefix?: string;
  suggestedMinutes?: number;
  defaultMinutes?: number;
  maxLabel?: string;
  onSelect: (minutes: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(defaultMinutes ?? null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);

  function handleManualSubmit() {
    const value = hours * 60 + minutes;
    if (value < 1) return;
    setSelected(value);
    onSelect(value);
  }

  return (
    <div className="flex flex-col gap-5">
      {maxLabel && (
        <p className="my-4 text-center text-xs leading-relaxed text-muted-foreground">
          Con esta energía sugerimos sesiones de hasta {maxLabel}. Tú decides si quieres más o menos.
        </p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {chips.map((minutes) => {
          const isSuggested = suggestedMinutes !== undefined && minutes === suggestedMinutes;
          const isSelected = selected === minutes;
          return (
            <motion.button
              key={minutes}
              type="button"
              onClick={() => {
                setSelected(minutes);
                onSelect(minutes);
              }}
              title={`${chipPrefix}${minutes} minutos`}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.08 }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border bg-surface px-3 py-4 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                isSelected
                  ? "border-foreground bg-foreground text-background shadow-md ring-1 ring-foreground"
                  : isSuggested
                    ? "border-accent-aprender bg-accent-aprender/5 ring-1 ring-accent-aprender"
                    : "border-border hover:border-foreground/40 hover:bg-surface-hover",
              )}
            >
              <span
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  isSelected
                    ? "text-background"
                    : isSuggested
                      ? "text-accent-aprender"
                      : "text-foreground",
                )}
              >
                {chipPrefix}
                {minutes}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isSelected ? "text-background/70" : "text-muted-foreground",
                )}
              >
                min
              </span>
              {isSelected && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground">
                  <Check className="size-3" />
                  seleccionado
                </span>
              )}
              {!isSelected && isSuggested && (
                <span className="mt-1 rounded-full bg-accent-aprender px-2 py-0.5 text-[10px] font-semibold text-white">
                  recomendado
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">O elige el tiempo que quieras</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <select
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          aria-label="Horas"
          className="h-11 cursor-pointer rounded-xl border border-border bg-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>{h} h</option>
          ))}
        </select>
        <select
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          aria-label="Minutos"
          className="h-11 cursor-pointer rounded-xl border border-border bg-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m} min</option>
          ))}
        </select>
        <Button
          type="button"
          variant="secondary"
          onClick={handleManualSubmit}
          disabled={hours * 60 + minutes < 1}
        >
          Usar
        </Button>
      </div>
    </div>
  );
}
