"use client";

import { useEffect, useRef } from "react";
import { flushOfflineQueue } from "@/features/offline/queue-flush";

/** Drena la cola offline al montar y al recuperar la red. Best-effort. */
export function useOfflineFlush() {
  const didFlush = useRef(false);

  useEffect(() => {
    if (didFlush.current) return;
    didFlush.current = true;
    void flushOfflineQueue().catch(() => {});
    function onOnline() {
      void flushOfflineQueue().catch(() => {});
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);
}
