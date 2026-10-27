"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

const VISIBLE_MS = 5_000;

function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest === 0
      ? `${hours} hora${hours === 1 ? "" : "s"}`
      : `${hours}h ${rest}m`;
  }
  return `${minutes} min`;
}

export function WelcomeBackCard({
  firstName,
  completedSessions,
  totalMinutes,
  lastActivity,
}: {
  firstName: string;
  completedSessions: number;
  totalMinutes: number;
  lastActivity?: string | null;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  const encouragement =
    completedSessions > 0
      ? `Has completado ${completedSessions} ${
          completedSessions === 1 ? "sesión" : "sesiones"
        } y ${formatMinutes(totalMinutes)} de enfoque. ¡Sigue así!`
      : "Hoy es un gran día para empezar a construir tu constancia. ¡Un paso a la vez!";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative flex w-full max-w-5xl flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-4 pr-10 shadow-sm"
        >
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Cerrar mensaje de bienvenida"
            title="Cerrar mensaje"
            className="absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-start gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900/40 dark:text-indigo-400">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Recordatorio
              </p>
              <h2 className="font-display text-base font-semibold text-foreground">
                ¡Hola de nuevo, {firstName}!
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">{encouragement}</p>
              {lastActivity && (
                <p className="mt-1 text-xs text-foreground">
                  Última actividad:{" "}
                  <span className="font-semibold text-accent-aprender">{lastActivity}</span>
                </p>
              )}
            </div>
          </div>

          <motion.span
            aria-hidden="true"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: VISIBLE_MS / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-0.5 bg-accent-aprender/50"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
