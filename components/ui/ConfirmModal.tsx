"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  requirePassword?: boolean;
  isPending?: boolean;
  error?: string | null;
  password?: string;
  onPasswordChange?: (value: string) => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  variant = "danger",
  requirePassword = false,
  isPending = false,
  error = null,
  password = "",
  onPasswordChange,
  onConfirm,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    confirmButtonRef.current?.focus();
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

  const canConfirm = requirePassword ? password.length > 0 : true;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
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
              {variant === "danger" && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <AlertTriangle className="size-5" />
                </span>
              )}
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
                <div className="text-sm text-muted-foreground">{message}</div>
              </div>
            </div>

            {requirePassword && (
              <Input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange?.(event.target.value)}
                placeholder="Contraseña"
                autoComplete="current-password"
              />
            )}

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                ref={confirmButtonRef}
                variant={variant === "danger" ? "danger" : "primary"}
                disabled={isPending || !canConfirm}
                onClick={onConfirm}
              >
                {isPending ? "Eliminando..." : confirmLabel}
              </Button>
              <Button type="button" variant="ghost" disabled={isPending} onClick={onClose}>
                {cancelLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
