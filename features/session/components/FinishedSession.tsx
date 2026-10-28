"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CompletionAlarm } from "@/features/session/components/CompletionAlarm";
import { FinishScreen } from "@/features/session/components/FinishScreen";
import { extendSessionAction } from "@/features/session/actions/session.actions";
import { useSessionStore } from "@/features/session/store/session.store";
import { ROUTES } from "@/lib/routes";
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

export function FinishedSession({ session }: { session: SessionDTO }) {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [isPending, startTransition] = useTransition();
  const [alarmDone, setAlarmDone] = useState(false);
  const alarmSeen = useSyncExternalStore(
    subscribeNoop,
    () => readAlarmSeen(session.id),
    () => false,
  );

  useEffect(() => {
    const current = useSessionStore.getState().session;
    if (!current || current.status !== "ACTIVE" || current.id === session.id) {
      setSession(session);
    }
  }, [session, setSession]);

  useEffect(() => {
    if (session.status === "ACTIVE") router.replace(ROUTES.session);
  }, [session.status, router]);

  const handleAlarmDone = useCallback(() => {
    try {
      sessionStorage.setItem(ALARM_SEEN_KEY + session.id, "1");
    } catch {
      // Storage unavailable.
    }
    setAlarmDone(true);
  }, [session.id]);

  const handleExtend = useCallback(
    (extraMinutes: number) => {
      startTransition(async () => {
        const result = await extendSessionAction({ id: session.id, extraMinutes });
        if (!result.success) return;
        setSession(result.session);
        router.replace(ROUTES.session);
      });
    },
    [router, session.id, setSession],
  );

  if (session.status === "ACTIVE") return null;

  if (!alarmDone && !alarmSeen) {
    return (
      <CompletionAlarm
        session={{
          subcategoryName: session.subcategoryName,
          categoryName: session.categoryName,
        }}
        onDone={handleAlarmDone}
      />
    );
  }

  return (
    <FinishScreen session={session} isPending={isPending} onExtend={handleExtend} />
  );
}
