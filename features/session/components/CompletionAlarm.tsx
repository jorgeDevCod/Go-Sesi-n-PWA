"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, PartyPopper, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { playCompletionAlarm, vibrateOnCompletion } from "@/features/session/session-sound";

const ALARM_SECONDS = 7;
const MIN_EXTRA = 1;
const MAX_EXTRA = 180;

const MESSAGES = [
  "¡Lo lograste! Cada minuto suma. 🎉",
  "¡Sesión completada! Tu constancia te está llevando lejos. 💪",
  "¡Excelente trabajo! Un paso más hacia lo que quieres. ⭐",
  "¡Tiempo cumplido! Go está orgulloso de ti. 🚀",
  "¡Bien hecho! Ese espacio que reservaste ya cuenta. 🎯",
];

export function CompletionAlarm({
  session,
  onDone,
  onExtend,
  canExtend = false,
  isPending = false,
}: {
  session: { subcategoryName: string; categoryName: string };
  onDone: () => void;
  onExtend?: (minutes: number) => void;
  canExtend?: boolean;
  isPending?: boolean;
}) {
  const [remaining, setRemaining] = useState(ALARM_SECONDS);
  const [showExtend, setShowExtend] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const stopAlarmRef = useRef<(() => void) | null>(null);
  const [message] = useState(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
  );

  useEffect(() => {
    stopAlarmRef.current = playCompletionAlarm(ALARM_SECONDS);
    vibrateOnCompletion();

    return () => {
      stopAlarmRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (showExtend) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [showExtend]);

  useEffect(() => {
    if (remaining === 0 && !showExtend) {
      stopAlarmRef.current?.();
      onDone();
    }
  }, [remaining, showExtend, onDone]);

  if (typeof document === "undefined") return null;

  function handleDismiss() {
    stopAlarmRef.current?.();
    onDone();
  }

  function handleShowExtend() {
    stopAlarmRef.current?.();
    setShowExtend(true);
  }

  function handleExtend() {
    if (!onExtend) return;
    onExtend(Math.min(MAX_EXTRA, Math.max(MIN_EXTRA, Math.round(minutes))));
  }

  const progress = 1 - remaining / ALARM_SECONDS;

  return createPortal(
    <AnimatePresence>
      {remaining > 0 && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Sesión finalizada"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-border bg-surface p-6 text-center shadow-xl"
          >
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              className="flex size-16 items-center justify-center rounded-full bg-accent-aprender/15 text-accent-aprender"
            >
              <PartyPopper className="size-8" />
            </motion.span>

            <div className="flex flex-col gap-1.5">
              <p className="text-base font-semibold text-foreground">
                {session.subcategoryName} · {session.categoryName}
              </p>
              <h2 className="font-display text-2xl font-bold text-foreground">{message}</h2>
            </div>

            {!showExtend ? (
              <>
                <div className="w-full">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <motion.div
                      className="h-full rounded-full bg-accent-aprender"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ ease: "linear", duration: 1 }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Se apagará sola en {remaining}s
                  </p>
                </div>

                <Button onClick={handleDismiss} className="w-full gap-2">
                  <Check className="size-5" />
                  ¡Genial! Vamos por más
                </Button>

                {canExtend && onExtend && (
                  <button
                    type="button"
                    onClick={handleShowExtend}
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-accent-aprender underline underline-offset-4 transition-colors hover:text-accent-aprender-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                  >
                    <Plus className="size-4" />
                    Agregar más tiempo
                  </button>
                )}
              </>
            ) : (
              <div className="flex w-full flex-col gap-3">
                <label className="flex flex-col gap-1.5 text-left">
                  <span className="text-sm font-medium text-foreground">Minutos extra</span>
                  <Input
                    type="number"
                    min={MIN_EXTRA}
                    max={MAX_EXTRA}
                    value={minutes}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setMinutes(Number.isFinite(value) ? value : MIN_EXTRA);
                    }}
                    aria-label="Minutos extra"
                  />
                </label>
                <Button
                  onClick={handleExtend}
                  disabled={isPending || minutes < MIN_EXTRA}
                  className="w-full"
                >
                  {isPending ? "Iniciando..." : "Iniciemos"}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowExtend(false)}
                  disabled={isPending}
                  className="cursor-pointer text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Volver
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
