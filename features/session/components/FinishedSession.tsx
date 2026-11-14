"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CompletionAlarm } from "@/features/session/components/CompletionAlarm";
import { ExtendSessionModal } from "@/features/session/components/ExtendSessionModal";
import { FinishScreen } from "@/features/session/components/FinishScreen";
import { extendSessionAction } from "@/features/session/actions/session.actions";
import { playSessionSound } from "@/features/session/sound-manager";
import { useSessionStore } from "@/features/session/store/session.store";
import { ROUTES } from "@/lib/routes";
import type { SessionDTO } from "@/services/session/session.dto";

const ALARM_SEEN_KEY = "gosession-alarm-seen-";
const EXTEND_PROMPT_KEY = "gosession-extend-prompt-";

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

function extendPromptKey(session: SessionDTO): string {
  return `${EXTEND_PROMPT_KEY}${session.id}-${session.extendedCount}`;
}

function readExtendPromptSeen(session: SessionDTO): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(extendPromptKey(session)) === "1";
  } catch {
    return false;
  }
}

export function FinishedSession({ session }: { session: SessionDTO }) {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [isPending, startTransition] = useTransition();
  const [alarmDone, setAlarmDone] = useState(false);
  const [extendPromptDone, setExtendPromptDone] = useState(false);
  const extendPromptSeen = useSyncExternalStore(
    subscribeNoop,
    () => readExtendPromptSeen(session),
    () => false,
  );
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

  useEffect(() => {
    if (session.status !== "COMPLETED") return;
    playSessionSound(
      session.mode === "POMODORO" ? "cycles-complete" : "session-complete",
    );
  }, [session.id, session.mode, session.status]);

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

  const handleFinalize = useCallback(() => {
    try {
      sessionStorage.setItem(extendPromptKey(session), "1");
    } catch {
      // Storage unavailable.
    }
    setExtendPromptDone(true);
  }, [session]);

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

  const shouldOfferExtend =
    session.mode === "POMODORO" &&
    session.status === "COMPLETED" &&
    !extendPromptDone &&
    !extendPromptSeen;

  if (shouldOfferExtend) {
    return (
      <ExtendSessionModal
        open
        isPending={isPending}
        onAdd={handleExtend}
        onFinalize={handleFinalize}
      />
    );
  }

  return (
    <FinishScreen session={session} isPending={isPending} onExtend={handleExtend} />
  );
}
