"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const MIN_EXTRA = 1;
const MAX_EXTRA = 180;

export function ExtendSessionModal({
  open,
  isPending,
  onAdd,
  onFinalize,
}: {
  open: boolean;
  isPending: boolean;
  onAdd: (minutes: number) => void;
  onFinalize: () => void;
}) {
  const [minutes, setMinutes] = useState(10);

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
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Agregar más tiempo"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-xl"
          >
            <button
              type="button"
              onClick={onFinalize}
              aria-label="Finalizar"
              className="absolute top-3.5 right-3.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="pr-8">
              <h2 className="font-display text-lg font-semibold text-foreground">
                ¿Quieres añadir más tiempo?
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Puedes continuar esta actividad unos minutos más o cerrar la sesión aquí.
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Minutos extra</span>
              <Input
                type="number"
                min={MIN_EXTRA}
                max={MAX_EXTRA}
                value={minutes}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setMinutes(Number.isFinite(value) ? value : MIN_EXTRA);
                }}
                aria-label="Minutos extra"
              />
            </label>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => onAdd(Math.min(MAX_EXTRA, Math.max(MIN_EXTRA, Math.round(minutes))))}
                disabled={isPending || minutes < MIN_EXTRA}
                className="w-full gap-2"
              >
                <Plus className="size-4" />
                {isPending ? "Iniciando..." : "Iniciemos"}
              </Button>
              <Button variant="ghost" onClick={onFinalize} disabled={isPending} className="w-full">
                Por ahora estoy bien. Finalizar!!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
