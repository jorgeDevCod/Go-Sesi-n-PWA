"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useActiveSession } from "@/features/session/hooks/useActiveSession";
import { useTimer } from "@/features/session/hooks/useTimer";
import { useSessionCompletionEffects } from "@/features/session/hooks/useSessionNotification";
import { useAppNotifications } from "@/features/session/hooks/useAppNotifications";
import { TimerScreen } from "@/features/session/components/TimerScreen";
import { FinishScreen } from "@/features/session/components/FinishScreen";
import { CompletionAlarm } from "@/features/session/components/CompletionAlarm";
import { SessionLoading } from "@/components/ui/Skeleton";
import type { SessionDTO } from "@/services/session/session.dto";

const ALARM_SEEN_KEY = "gosession-alarm-seen-";

function subscribeNoop() {
  return () => {};
}

function readAlarmSeen(sessionId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ALARM_SEEN_KEY + sessionId) === "1";
  } catch {
    return false;
  }
}

export function SessionExperience({ initialSession }: { initialSession: SessionDTO }) {
  useActiveSession(initialSession);
  const { session, view, isPending, pause, resume, finish, extend } = useTimer(initialSession);
  useSessionCompletionEffects(session);
  useAppNotifications(session);
  const router = useRouter();
  const alarmSeen = useSyncExternalStore(
    subscribeNoop,
    () => readAlarmSeen(initialSession.id),
    () => false,
  );
  const [alarmDone, setAlarmDone] = useState(false);

  useEffect(() => {
    if (session === null) {
      router.replace("/app/home");
    }
  }, [session, router]);

  if (!session || !view) return <SessionLoading />;

  if (session.status !== "ACTIVE") {
    // Muestra la alarma motivacional (15s) antes de la pantalla de finalización.
    if (!alarmDone && !alarmSeen) {
      return (
        <CompletionAlarm
          session={{ subcategoryName: session.subcategoryName, categoryName: session.categoryName }}
          onDone={() => {
            try {
              sessionStorage.setItem(ALARM_SEEN_KEY + session.id, "1");
            } catch {
              // Storage unavailable.
            }
            setAlarmDone(true);
          }}
        />
      );
    }
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
