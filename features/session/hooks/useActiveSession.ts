"use client";

import { useEffect, useRef } from "react";
import {
  readPersistedSession,
  useSessionStore,
  SESSION_STORAGE_KEY,
} from "@/features/session/store/session.store";
import { getActiveSessionAction } from "@/features/session/actions/session.actions";
import type { SessionDTO } from "@/services/session/session.dto";

/**
 * Keeps the active-session store in sync: seeds instantly from the
 * server-rendered initial DTO (if any) and localStorage on mount, reconciles
 * with the server (server always wins), and re-syncs whenever the tab
 * regains focus/visibility or another tab writes a new session to
 * localStorage.
 */
export function useActiveSession(initialSession?: SessionDTO | null) {
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const rehydratedRef = useRef(false);

  useEffect(() => {
    if (rehydratedRef.current) return;
    rehydratedRef.current = true;
    let cancelled = false;

    const persisted = readPersistedSession();
    // Si la vista cacheada trae una sesión ACTIVE pero ya existe una copia
    // terminal del mismo id, gana la terminal. Si la sesión inicial es una
    // sesión nueva, gana sobre cualquier copia terminal antigua.
    const terminal =
      initialSession &&
      persisted?.id === initialSession.id &&
      persisted.status !== "ACTIVE"
        ? persisted
        : null;
    const desired = terminal ?? initialSession ?? persisted ?? null;

    void Promise.resolve(useSessionStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      if (desired) setSession(desired);
    });

    return () => {
      cancelled = true;
    };
    // Seeding only ever happens once, on mount-initialSession/setSession
    // intentionally excluded from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncFromServer() {
      const result = await getActiveSessionAction();
      if (cancelled || !result.success) return;

      if (result.session) {
        setSession(result.session);
        return;
      }

      // Server has no ACTIVE session. If we're currently showing a
      // terminal (COMPLETED/INTERRUPTED) session locally-e.g. the finish
      // screen right after a session ended-keep it; that's expected and
      // the user still needs to see it. Only clear when we thought a
      // session was ACTIVE but the server disagrees (ended elsewhere).
      const current = useSessionStore.getState().session;
      if (current && current.status === "ACTIVE") {
        setSession(null);
      }
    }

    void syncFromServer();

    function onVisibilityChange() {
      if (document.visibilityState === "visible") void syncFromServer();
    }

    function onStorage(event: StorageEvent) {
      if (event.key === SESSION_STORAGE_KEY) {
        void useSessionStore.persist.rehydrate();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", syncFromServer);
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", syncFromServer);
      window.removeEventListener("storage", onStorage);
    };
  }, [setSession]);

  return { session };
}
