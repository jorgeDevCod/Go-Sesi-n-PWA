"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSessionStore } from "@/features/session/store/session.store";
import { deriveTimerView, type TimerView } from "@/features/session/timer-view";
import type { SessionDTO } from "@/services/session/session.dto";
import {
  completeSessionAction,
  extendSessionAction,
  interruptSessionAction,
  pauseSessionAction,
  resumeSessionAction,
} from "@/features/session/actions/session.actions";

/**
 * `fallbackSession` covers the one unavoidable render before the store's
 * seeding effect (in useActiveSession) has run: without it, `session` would
 * briefly read as null even though a server-rendered initial session exists,
 * which would incorrectly trigger a "no active session" redirect.
 */
export function useTimer(fallbackSession?: SessionDTO | null) {
  const storeSession = useSessionStore((s) => s.session);
  const session = storeSession ?? fallbackSession ?? null;
  const skewMs = useSessionStore((s) => s.skewMs);
  const setSession = useSessionStore((s) => s.setSession);
  // Seeded from the server-provided DTO's own `serverNowMs` (plain prop
  // data, identical on server and client) rather than a fresh Date.now()
  // call, so the very first render can't hydration-mismatch. The interval
  // below is the only place real clock reads happen from here on, and it
  // does so inside an effect/callback-never during render-which is the
  // distinction `useSyncExternalStore` doesn't actually help with here:
  // Date.now() changes on every read, so it can never be a stable snapshot,
  // which is what caused the "getSnapshot should be cached" loop.
  const [nowMs, setNowMs] = useState(() => fallbackSession?.serverNowMs ?? Date.now());
  const [isPending, startTransition] = useTransition();
  const autoCompletingForId = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") setNowMs(Date.now());
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const view: TimerView | null = useMemo(() => {
    if (!session) return null;
    return deriveTimerView(session, nowMs + skewMs);
  }, [session, skewMs, nowMs]);

  useEffect(() => {
    if (!session || session.status !== "ACTIVE") return;
    if (!view || !view.hasReachedTarget || view.isPaused) return;
    if (autoCompletingForId.current === session.id) return;

    autoCompletingForId.current = session.id;
    startTransition(async () => {
      const result = await completeSessionAction({ id: session.id });
      if (result.success) setSession(result.session);
    });
  }, [session, view, setSession]);

  function pause() {
    if (!session) return;
    startTransition(async () => {
      const result = await pauseSessionAction({ id: session.id });
      if (result.success) setSession(result.session);
    });
  }

  function resume() {
    if (!session) return;
    startTransition(async () => {
      const result = await resumeSessionAction({ id: session.id });
      if (result.success) setSession(result.session);
    });
  }

  function finish() {
    if (!session) return;
    startTransition(async () => {
      const result = await interruptSessionAction({ id: session.id });
      if (result.success) setSession(result.session);
    });
  }

  function extend(extraMinutes: number) {
    if (!session) return;
    startTransition(async () => {
      const result = await extendSessionAction({ id: session.id, extraMinutes });
      if (result.success) setSession(result.session);
    });
  }

  return { session, view, isPending, pause, resume, finish, extend };
}
