"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSessionStore } from "@/features/session/store/session.store";
import { deriveTimerView } from "@/features/session/timer-view";
import {
  getActiveSessionAction,
  interruptSessionAction,
} from "@/features/session/actions/session.actions";

const DISMISSED_KEY = "gosession-resume-dismissed-for";

function getDismissedKey(sessionId: string) {
  return `${DISMISSED_KEY}-${sessionId}`;
}

export function ResumeSessionPrompt({ userName }: { userName: string }) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [dismissed, setDismissed] = useState(false);
  const [isIgnoring, setIsIgnoring] = useState(false);
  // Lazy initializer is evaluated once on mount, so it stays a pure render.
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function sync() {
      const result = await getActiveSessionAction();
      if (cancelled || !result.success) return;
      if (!result.session) {
        const current = useSessionStore.getState().session;
        if (current && current.status === "ACTIVE") {
          useSessionStore.getState().clearSession();
        }
      }
    }
    void sync();
    return () => {
      cancelled = true;
    };
  }, []);

  if (typeof document === "undefined") return null;

  const activeSession = session && session.status === "ACTIVE" ? session : null;

  if (!activeSession) return null;

  try {
    if (window.localStorage.getItem(getDismissedKey(activeSession.id)) === "1") {
      return null;
    }
  } catch {
    // Storage unavailable.
  }

  if (dismissed) return null;

  const skewMs = useSessionStore.getState().skewMs;
  const view = deriveTimerView(activeSession, nowMs + skewMs);
  const remainingText = view.hasHours
    ? `${parseInt(view.hourPart, 10)}h ${parseInt(view.minutePart, 10)}m ${parseInt(view.secondPart, 10)}s`
    : `${view.formattedTime}`;

  function handleContinue() {
    router.push("/app/session");
  }

  async function handleIgnore() {
    if (!activeSession) return;
    setIsIgnoring(true);
    const result = await interruptSessionAction({ id: activeSession.id });
    if (result.success) {
      clearSession();
    }
    try {
      window.localStorage.setItem(getDismissedKey(activeSession.id), "1");
    } catch {
      // Storage unavailable.
    }
    setDismissed(true);
    setIsIgnoring(false);
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        role="presentation"
      >
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-label="Sesión inconclusa"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex w-full max-w-md flex-col gap-5 rounded-3xl border border-border bg-surface p-6 shadow-xl"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <AlertCircle className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Parece que dejaste una sesión sin terminar, {userName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Estabas en{" "}
                <span className="font-semibold text-foreground">
                  {activeSession.subcategoryName}
                </span>{" "}
                y aún te quedan{" "}
                <span className="font-semibold text-foreground">{remainingText}</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleContinue} className="w-full gap-2">
              <Play className="size-4 fill-current" />
              Continuar donde la dejé
            </Button>
            <Button
              variant="ghost"
              onClick={handleIgnore}
              disabled={isIgnoring}
              className="w-full"
            >
              {isIgnoring ? "Ignorando..." : "Ignorar esta actividad"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
