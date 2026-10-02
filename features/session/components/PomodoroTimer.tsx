"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CircularProgress } from "@/features/session/components/CircularProgress";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { InfoModal } from "@/components/ui/InfoModal";
import { Pause, Play } from "lucide-react";
import { formatRemaining } from "@/features/session/timer-view";
import { derivePomodoroView } from "@/services/session/pomodoro";
import { completeSessionAction } from "@/features/session/actions/session.actions";
import { useSessionStore } from "@/features/session/store/session.store";
import { playSoftCompletionSound, vibrateOnCompletion } from "@/features/session/session-sound";
import type { SessionDTO } from "@/services/session/session.dto";

function phaseLabel(
  phase: "focus" | "break" | "done",
  cycleIndex: number,
  cycles: number,
): string {
  if (phase === "focus") return `Foco ${cycleIndex + 1} de ${cycles}`;
  if (phase === "break") return "Descanso";
  return "¡Listo!";
}

export function PomodoroTimer({
  session,
  isPending,
  onPause,
  onResume,
  onFinish,
}: {
  session: SessionDTO;
  isPending: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}) {
  const config = session.pomodoroConfig;
  const skewMs = useSessionStore((s) => s.skewMs);
  const setSession = useSessionStore((s) => s.setSession);
  const [nowMs, setNowMs] = useState(() => session.serverNowMs);
  const [, startTransition] = useTransition();
  const [prompt, setPrompt] = useState<{ title: string; message: string } | null>(null);
  const lastPhaseKey = useRef<string | null>(null);
  const completingForId = useRef<string | null>(null);

  // El aviso de fase vive en el callback del intervalo (contexto de evento),
  // no en el cuerpo del effect: evita setState síncrono en effects y solo
  // se dispara en transiciones reales de fase.
  useEffect(() => {
    if (!config) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      const elapsedMs = Math.max(
        0,
        (session.pausedAtMs ?? now + skewMs) - session.startedAtMs - session.pausedMs,
      );
      const next = derivePomodoroView(elapsedMs, config, session.extendedMinutes * 60_000);
      const key = `${next.phase}:${next.cycleIndex}:${session.id}`;
      if (lastPhaseKey.current === null) {
        lastPhaseKey.current = key;
        return;
      }
      if (lastPhaseKey.current === key) return;
      lastPhaseKey.current = key;

      playSoftCompletionSound();
      vibrateOnCompletion();

      if (next.phase === "done") {
        if (completingForId.current === session.id) return;
        completingForId.current = session.id;
        startTransition(async () => {
          const result = await completeSessionAction({ id: session.id });
          if (result.success) setSession(result.session);
        });
        return;
      }

      if (!config.autoStart) {
        setPrompt(
          next.phase === "break"
            ? {
                title: "Descanso",
                message:
                  "Foco completado. Tómate el descanso: el reloj sigue corriendo y avisará al volver.",
              }
            : {
                title: `Foco ${next.cycleIndex + 1} de ${config.cycles}`,
                message: "Descanso terminado. Vuelve al foco cuando estés lista o listo.",
              },
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session, config, skewMs, setSession]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") setNowMs(Date.now());
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const view = useMemo(() => {
    if (!config) return null;
    const referenceNow = session.pausedAtMs ?? nowMs + skewMs;
    const elapsedMs = Math.max(0, referenceNow - session.startedAtMs - session.pausedMs);
    return derivePomodoroView(elapsedMs, config, session.extendedMinutes * 60_000);
  }, [config, session, nowMs, skewMs]);

  function handleFinish() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("¿Seguro que quieres finalizar antes de tiempo?")
    ) {
      return;
    }
    onFinish();
  }

  if (!config || !view) return null;

  const isPaused = session.pausedAtMs !== null;
  const color = session.subcategoryColor;
  const ringColor = isPaused ? "#F59E0B" : color;
  const phaseTotalMs = view.phaseElapsedMs + view.phaseRemainingMs;
  const progressRatio = phaseTotalMs > 0 ? 1 - view.phaseRemainingMs / phaseTotalMs : 0;

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
        <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Pomodoro {config.focusMin}/{config.breakMin} × {config.cycles}
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-4">
        <CircularProgress progressRatio={progressRatio} color={ringColor} size={260} strokeWidth={14}>
          <div className="flex flex-col items-center leading-none">
            <span className="text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
              {formatRemaining(view.phaseRemainingMs)}
            </span>
            <span className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
              {phaseLabel(view.phase, view.cycleIndex, config.cycles)}
            </span>
          </div>
        </CircularProgress>

        {isPaused && (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
            Pausado
          </span>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Foco total {Math.floor(view.totalFocusMs / 60_000)} min</span>
          <span className="text-border">·</span>
          <span>Planificado {session.plannedMinutes} min</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={isPaused ? onResume : onPause}
          disabled={isPending}
          aria-label={isPaused ? "Reanudar" : "Pausar"}
          title={isPaused ? "Reanudar" : "Pausar"}
          className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-accent-aprender text-white shadow-lg transition-all duration-200 hover:bg-accent-aprender-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          {isPaused ? (
            <Play className="size-7 fill-current" />
          ) : (
            <Pause className="size-7 fill-current" />
          )}
        </button>
        <Button variant="danger" onClick={handleFinish} disabled={isPending} title="Finalizar" size="md">
          Finalizar sesión
        </Button>
      </div>

      <InfoModal
        open={prompt !== null}
        onClose={() => setPrompt(null)}
        title={prompt?.title ?? ""}
        message={prompt?.message ?? ""}
        confirmLabel="Continuar"
      />
    </div>
  );
}
