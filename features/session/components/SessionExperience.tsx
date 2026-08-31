"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveSession } from "@/features/session/hooks/useActiveSession";
import { useTimer } from "@/features/session/hooks/useTimer";
import { useSessionCompletionEffects } from "@/features/session/hooks/useSessionNotification";
import { TimerScreen } from "@/features/session/components/TimerScreen";
import { FinishScreen } from "@/features/session/components/FinishScreen";
import { SessionLoading } from "@/components/ui/Skeleton";
import type { SessionDTO } from "@/services/session/session.dto";

export function SessionExperience({ initialSession }: { initialSession: SessionDTO }) {
  useActiveSession(initialSession);
  const { session, view, isPending, pause, resume, finish, extend } = useTimer(initialSession);
  useSessionCompletionEffects(session);
  const router = useRouter();

  useEffect(() => {
    if (session === null) {
      router.replace("/app/home");
    }
  }, [session, router]);

  if (!session || !view) return <SessionLoading />;

  if (session.status !== "ACTIVE") {
    return <FinishScreen session={session} isPending={isPending} onExtend={extend} />;
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
