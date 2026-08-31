"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const STORAGE_KEY = "gosession-welcome-back-seen";

function subscribeNoop() {
  return () => {};
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

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
  const wasDismissedBefore = useSyncExternalStore(
    subscribeNoop,
    readDismissed,
    getServerSnapshot,
  );
  const [justDismissed, setJustDismissed] = useState(false);

  if (wasDismissedBefore || justDismissed) return null;

  const encouragement =
    completedSessions > 0
      ? `Actualmente has completado ${completedSessions} ${
          completedSessions === 1 ? "sesión" : "sesiones"
        }. Y un total de ${formatMinutes(totalMinutes)} de tiempo completado. Se nota tu esfuerzo!!`
      : "Hoy es un gran día para empezar a construir tu constancia. ¡Un paso a la vez!";

  function dismiss() {
    setJustDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage unavailable.
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar mensaje de bienvenida"
        title="Cerrar mensaje"
        className="absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900/40 dark:text-indigo-400">
          <Sparkles className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-foreground">
            ¡Hola de nuevo, {firstName}!
          </h2>
          <p className="text-sm text-muted-foreground">¡Qué gusto tenerte de vuelta!</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{encouragement}</p>

      {lastActivity && (
        <p className="rounded-xl bg-accent-aprender/5 px-3 py-2 text-xs text-foreground">
          Tu última actividad fue: <span className="font-semibold text-accent-aprender">{lastActivity}</span>
        </p>
      )}
    </motion.div>
  );
}
