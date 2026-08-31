"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function subscribeNoop() {
  return () => {};
}

/**
 * Builds stable getSnapshot/getServerSnapshot functions for a given storage
 * key. Unlike a raw Date.now()-style read, localStorage only actually
 * changes when something writes to it, so this snapshot IS safe to read
 * during render via useSyncExternalStore (server always sees "not
 * dismissed"; the client's real stored value pops in right after hydration
 * without a mismatch warning-that asymmetry is exactly what the third
 * argument is for).
 */
function readDismissed(storageKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

export function DismissibleHint({
  storageKey,
  children,
  className,
}: {
  storageKey: string;
  children: ReactNode;
  className?: string;
}) {
  const wasDismissedBefore = useSyncExternalStore(
    subscribeNoop,
    () => readDismissed(storageKey),
    getServerSnapshot,
  );
  const [justDismissed, setJustDismissed] = useState(false);

  if (wasDismissedBefore || justDismissed) return null;

  function dismiss() {
    setJustDismissed(true);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // Storage unavailable-the hint just won't stay dismissed next visit.
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-border bg-surface-muted p-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <p className="flex-1">{children}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar aviso"
        title="Cerrar aviso"
        className="shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
