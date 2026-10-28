"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import {
  encouragementLeadForToday,
  welcomeGreetingForToday,
} from "@/features/home/daily-greetings";

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
  const greeting = welcomeGreetingForToday(firstName);
  const encouragement =
    completedSessions > 0
      ? `${encouragementLeadForToday()} ${completedSessions} ${
          completedSessions === 1 ? "sesión" : "sesiones"
        } y ${formatMinutes(totalMinutes)} de enfoque. ¡Sigue así!`
      : "Hoy es un gran día para empezar a construir tu constancia. ¡Un paso a la vez!";

  if (!visible) return null;

  return (
    <div className="flex w-full max-w-[700px] items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-sm">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900/40 dark:text-indigo-400">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-pretty text-foreground">{greeting}</p>
        <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
          {encouragement}
          {lastActivity && (
            <>
              {" "}
              Última actividad:{" "}
              <span className="font-semibold text-accent-aprender">{lastActivity}</span>.
            </>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Cerrar mensaje de bienvenida"
        className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
