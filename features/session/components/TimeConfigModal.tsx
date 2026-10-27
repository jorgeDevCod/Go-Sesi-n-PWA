"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_MINUTES, MIN_MINUTES, parseDurationInput } from "@/lib/duration-parser";
import { cn } from "@/lib/utils";

const QUICK_MINUTES = [15, 25, 30, 45, 60, 75, 90];

export function TimeConfigModal({
  open,
  initialMinutes,
  onClose,
  onApply,
}: {
  open: boolean;
  initialMinutes: number;
  onClose: () => void;
  onApply: (minutes: number) => void;
}) {
  const [draft, setDraft] = useState(String(initialMinutes));
  const [value, setValue] = useState(initialMinutes);
  const [wasOpen, setWasOpen] = useState(open);

  if (open && !wasOpen) {
    setWasOpen(true);
    setValue(initialMinutes);
    setDraft(String(initialMinutes));
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function commit(raw: string) {
    const parsed = parseDurationInput(raw);
    if (parsed === null) {
      setDraft(String(value));
      return;
    }
    setValue(parsed);
    setDraft(String(parsed));
  }

  function move(delta: number) {
    const next = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, value + delta));
    setValue(next);
    setDraft(String(next));
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Ajustar tiempo"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3.5 right-3.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="pr-8">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Ajusta tu tiempo
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Elige un tiempo rápido o escribe exactamente cuánto quieres.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {QUICK_MINUTES.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => {
                    setValue(minutes);
                    setDraft(String(minutes));
                  }}
                  aria-pressed={value === minutes}
                  className={cn(
                    "cursor-pointer rounded-xl border px-2 py-2 text-sm font-semibold transition-colors",
                    value === minutes
                      ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                      : "border-border bg-surface text-foreground hover:bg-surface-hover",
                  )}
                >
                  {minutes}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted p-3">
              <button
                type="button"
                onClick={() => move(-5)}
                disabled={value <= MIN_MINUTES}
                aria-label="Reducir tiempo"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <label className="flex items-baseline justify-center gap-1.5">
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
                      setDraft(String(value));
                      event.currentTarget.blur();
                    }
                  }}
                  onFocus={(event) => event.currentTarget.select()}
                  inputMode="numeric"
                  aria-label="Minutos"
                  className="w-24 bg-transparent text-center text-4xl font-bold tabular-nums text-foreground outline-none"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </label>
              <button
                type="button"
                onClick={() => move(5)}
                disabled={value >= MAX_MINUTES}
                aria-label="Aumentar tiempo"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  const parsed = parseDurationInput(draft);
                  onApply(parsed ?? value);
                }}
              >
                Aplicar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
