"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PlanContinuePrompt({
  open,
  onKeepPlan,
  onStartFresh,
}: {
  open: boolean;
  onKeepPlan: () => void;
  onStartFresh: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onKeepPlan();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onKeepPlan]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Planificación actual"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-border bg-surface p-6 text-center shadow-xl"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender">
              <CalendarCheck2 className="size-6" />
            </span>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Tienes una planificación actual
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ¿Quieres mantener tu plan de hoy o empezar desde cero?
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Button size="lg" onClick={onKeepPlan} className="w-full">
                <Sparkles className="size-4" />
                Continuemos planificación
              </Button>
              <Button variant="secondary" size="md" onClick={onStartFresh} className="w-full">
                Iniciemos desde cero
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
