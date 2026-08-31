"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failing (e.g. unsupported context) is non-fatal —
      // the app works identically without it, just without the offline
      // fallback page.
    });
  }, []);

  return null;
}
