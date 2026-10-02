"use client";

import { useEffect, useRef } from "react";

/**
 * Mantiene la pantalla encendida mientras hay sesión activa (6A).
 * Best-effort: sin soporte o sin permiso, no hace nada y nada se rompe.
 * Re-adquiere al volver visible (el SO puede soltar el lock en segundo plano).
 */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function acquire() {
      try {
        if (!("wakeLock" in navigator) || !navigator.wakeLock) return;
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await lock.release().catch(() => {});
          return;
        }
        lockRef.current = lock;
        lock.addEventListener("release", () => {
          lockRef.current = null;
        });
      } catch {
        // Denegado o no soportado: la sesión sigue sin lock.
      }
    }

    void acquire();

    function onVisibilityChange() {
      if (document.visibilityState === "visible" && !lockRef.current) {
        void acquire();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      const lock = lockRef.current;
      lockRef.current = null;
      if (lock) {
        void lock.release().catch(() => {});
      }
    };
  }, [active]);
}
