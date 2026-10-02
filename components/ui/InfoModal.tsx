"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

type InfoModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  icon?: ReactNode;
};

/**
 * Modal informativo (no destructivo) reutilizable, alineado al estilo de la
 * plataforma. Se usa, por ejemplo, para avisar que lo eliminado puede
 * recuperarse desde la papelera.
 */
export function InfoModal({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Entendido",
  icon,
}: InfoModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-aprender/10 text-accent-aprender">
                {icon ?? <Info className="size-5" />}
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
                <div className="text-sm leading-relaxed text-muted-foreground">{message}</div>
              </div>
            </div>

            <Button onClick={onClose} className="w-full">
              {confirmLabel}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
