"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveSession } from "@/features/session/hooks/useActiveSession";
import { useTimer } from "@/features/session/hooks/useTimer";
import { useWakeLock } from "@/features/session/hooks/useWakeLock";
import { useLiveSessionNotification } from "@/features/session/hooks/useLiveSessionNotification";
import { useSessionCompletionEffects } from "@/features/session/hooks/useSessionNotification";
import { TimerScreen } from "@/features/session/components/TimerScreen";
import { PomodoroTimer } from "@/features/session/components/PomodoroTimer";
import { SessionLoading } from "@/components/ui/Skeleton";
import { ROUTES } from "@/lib/routes";
import type { SessionDTO } from "@/services/session/session.dto";

export function SessionExperience({ initialSession }: { initialSession: SessionDTO }) {
  useActiveSession(initialSession);
  // En pomodoro el PomodoroTimer decide el fin (fase done): se desactiva el
  // auto-complete clásico para no duplicar la llamada. Clásico intacto.
  const { session, view, isPending, pause, resume, finish } = useTimer(initialSession, {
    autoComplete: initialSession.mode !== "POMODORO",
  });
  useSessionCompletionEffects(session);
  useLiveSessionNotification(session);
  const router = useRouter();
  // Pantalla encendida solo con sesión activa (best-effort, sin UI ni home).
  useWakeLock(session?.status === "ACTIVE");

  useEffect(() => {
    if (session === null) {
      router.replace(ROUTES.home);
      return;
    }
    if (session.status !== "ACTIVE") {
      // La URL de finalización reemplaza a la del cronómetro para que "atrás"
      // no pueda volver a abrirlo.
      router.replace(ROUTES.sessionFinished(session.id));
    }
  }, [session, router]);

  if (!session || !view) return <SessionLoading />;
  if (session.status !== "ACTIVE") return <SessionLoading />;

  if (session.mode === "POMODORO" && session.pomodoroConfig) {
    return (
      <PomodoroTimer
        session={session}
        isPending={isPending}
        onPause={pause}
        onResume={resume}
        onFinish={finish}
      />
    );
  }

  return (
    <TimerScreen
      session={session}
      view={view}
      isPending={isPending}
      onPause={pause}
      onResume={resume}
      onFinish={finish}
    />
  );
}
