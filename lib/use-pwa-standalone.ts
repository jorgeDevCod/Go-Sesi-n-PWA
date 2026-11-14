"use client";

import { useSyncExternalStore } from "react";
import { isStandalonePwa } from "@/lib/pwa";

function subscribe(callback: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const queries = [
    window.matchMedia("(display-mode: standalone)"),
    window.matchMedia("(display-mode: minimal-ui)"),
  ];
  for (const query of queries) query.addEventListener("change", callback);
  return () => {
    for (const query of queries) query.removeEventListener("change", callback);
  };
}

export function useIsStandalonePwa() {
  return useSyncExternalStore(
    subscribe,
    () => isStandalonePwa(),
    () => false,
  );
}
