"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, Check } from "lucide-react";
import { playCompletionAlarm, vibrateOnCompletion } from "@/features/session/session-sound";

const ALARM_SECONDS = 15;

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
}: {
  session: { subcategoryName: string; categoryName: string };
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(ALARM_SECONDS);
  const stopAlarmRef = useRef<(() => void) | null>(null);
  const msgIndex = useRef(Math.floor(Math.random() * MESSAGES.length));
  const message = MESSAGES[msgIndex.current];

  useEffect(() => {
    stopAlarmRef.current = playCompletionAlarm(ALARM_SECONDS);
    vibrateOnCompletion();

    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      stopAlarmRef.current?.();
    };
  }, []);

  // Al agotarse el tiempo, se apaga el sonido y se pasa a la vista de finalización.
  useEffect(() => {
    if (remaining === 0) {
      stopAlarmRef.current?.();
      onDone();
    }
  }, [remaining, onDone]);

  if (typeof document === "undefined") return null;

  function handleDismiss() {
    stopAlarmRef.current?.();
    onDone();
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

            {/* Barra de progreso de la alarma */}
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

            <button
              type="button"
              onClick={handleDismiss}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-accent-aprender px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-aprender-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <Check className="size-5" />
              ¡Genial! Vamos por más
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
