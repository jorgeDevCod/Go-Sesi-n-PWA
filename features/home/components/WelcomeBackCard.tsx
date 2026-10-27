"use client";

import { Sparkles } from "lucide-react";

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
  const encouragement =
    completedSessions > 0
      ? `Has completado ${completedSessions} ${
          completedSessions === 1 ? "sesión" : "sesiones"
        } y ${formatMinutes(totalMinutes)} de enfoque. ¡Sigue así!`
      : "Hoy es un gran día para empezar a construir tu constancia. ¡Un paso a la vez!";

  return (
    <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-sm">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900/40 dark:text-indigo-400">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          ¡Hola de nuevo, {firstName}!
        </p>
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
    </div>
  );
}
