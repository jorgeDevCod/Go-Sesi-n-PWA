"use client";

import { CircularProgress } from "@/features/session/components/CircularProgress";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { Pause, Play } from "lucide-react";
import type { TimerView } from "@/features/session/timer-view";
import type { SessionDTO } from "@/services/session/session.dto";

export function TimerScreen({
  session,
  view,
  isPending,
  onPause,
  onResume,
  onFinish,
}: {
  session: SessionDTO;
  view: TimerView;
  isPending: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}) {
  function handleFinish() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("¿Seguro que quieres finalizar antes de tiempo?")
    ) {
      return;
    }
    onFinish();
  }

  const color = session.subcategoryColor;
  const ringColor = view.isPaused ? "#F59E0B" : color;
  const remainingMinutes = Math.max(0, Math.ceil(view.remainingMs / 60_000));

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden bg-background px-4 py-12 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 35%, ${color}1a, transparent 60%)` }}
      />

      <div className="relative flex flex-col items-center gap-2">
        <span
          className="flex size-12 items-center justify-center rounded-2xl shadow-sm"
          style={{ backgroundColor: `${color}33`, color }}
        >
          <DynamicIcon name={session.subcategoryIcon} className="size-6" />
        </span>
        <p className="text-lg font-semibold text-foreground">{session.subcategoryName}</p>
        <p className="text-sm text-muted-foreground">{session.categoryName}</p>
      </div>

      <div className="relative flex flex-col items-center gap-4">
        <CircularProgress progressRatio={view.progressRatio} color={ringColor} size={260} strokeWidth={14}>
          {view.hasHours ? (
            <div className="flex flex-col items-center leading-none">
              <span className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                {parseInt(view.hourPart, 10)}h {parseInt(view.minutePart, 10)}m
              </span>
              <span className="mt-1 text-sm font-medium text-muted-foreground">
                {parseInt(view.secondPart, 10)}s restantes
              </span>
            </div>
          ) : (
            <>
              <span className="text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
                {view.formattedTime}
              </span>
              <span className="text-sm font-medium text-muted-foreground">restantes</span>
            </>
          )}
        </CircularProgress>

        {view.isPaused && (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
            Pausado
          </span>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Restante ≈ {remainingMinutes} min</span>
          <span className="text-border">·</span>
          <span>Planificado {session.plannedMinutes} min</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={view.isPaused ? onResume : onPause}
          disabled={isPending}
          aria-label={view.isPaused ? "Reanudar" : "Pausar"}
          title={view.isPaused ? "Reanudar" : "Pausar"}
          className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-accent-aprender text-white shadow-lg transition-all duration-200 hover:bg-accent-aprender-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          {view.isPaused ? (
            <Play className="size-7 fill-current" />
          ) : (
            <Pause className="size-7 fill-current" />
          )}
        </button>
        <Button
          variant="danger"
          onClick={handleFinish}
          disabled={isPending}
          title="Finalizar"
          size="md"
        >
          Finalizar sesión
        </Button>
      </div>
    </div>
  );
}
