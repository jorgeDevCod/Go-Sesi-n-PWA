"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function ExistingPlanPrompt({
  open,
  onKeep,
  onChange,
  isPending,
}: {
  open: boolean;
  onKeep: () => void;
  onChange: () => void;
  isPending: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onKeep();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onKeep]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onKeep}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Planificación existente"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8"
          >
            <div className="flex flex-col gap-3 text-center">
              <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                ¡Bienvenido de nuevo! Ya tienes un plan para hoy
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                ¿Quieres mantener tu plan actual o prefieres cambiarlo?
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Button onClick={onChange} disabled={isPending} className="w-full">
                Quiero cambiarlo
              </Button>
              <Button variant="secondary" onClick={onKeep} disabled={isPending} className="w-full">
                Seguir con mi plan
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
