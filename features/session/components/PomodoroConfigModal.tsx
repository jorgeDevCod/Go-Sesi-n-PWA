"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PomodoroScheduleEditor } from "@/features/session/components/PomodoroScheduleEditor";
import type { PomodoroConfig } from "@/services/session/pomodoro";

export function PomodoroConfigModal({
  open,
  initialConfig,
  onClose,
  onApply,
}: {
  open: boolean;
  initialConfig: PomodoroConfig;
  onClose: () => void;
  onApply: (config: PomodoroConfig) => void;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [wasOpen, setWasOpen] = useState(open);

  if (open && !wasOpen) {
    setWasOpen(true);
    setConfig(initialConfig);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Configurar Pomodoro"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex w-full max-w-md flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3.5 right-3.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="pr-8">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Configura tu Pomodoro
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Ajusta foco, descanso y ciclos. Se guardará para esta actividad.
              </p>
            </div>

            <PomodoroScheduleEditor config={config} onChange={setConfig} />

            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => onApply(config)}>Aplicar</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
