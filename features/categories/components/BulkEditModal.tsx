"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ComplexityPicker } from "@/components/ui/ComplexityPicker";
import { EnergyPicker } from "@/components/ui/EnergyPicker";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";

export type BulkEditValues = {
  complexity: Complexity;
  energyLevel: EnergyLevel | null;
};

export function BulkEditModal({
  open,
  count,
  itemLabel,
  isPending,
  error,
  onClose,
  onApply,
}: {
  open: boolean;
  count: number;
  itemLabel: string;
  isPending: boolean;
  error?: string | null;
  onClose: () => void;
  onApply: (values: BulkEditValues) => void;
}) {
  const [complexity, setComplexity] = useState<Complexity>("MEDIUM");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>("media");
  const [wasOpen, setWasOpen] = useState(open);

  if (open && !wasOpen) {
    setWasOpen(true);
    setComplexity("MEDIUM");
    setEnergyLevel("media");
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

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
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Editar ${itemLabel} seleccionadas`}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex w-full max-w-md flex-col gap-5 rounded-3xl border border-border bg-surface p-5 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3.5 right-3.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender">
                <SlidersHorizontal className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Editar {count} {itemLabel} seleccionadas
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Ajusta la dificultad y la energía para agruparlas y mejorar las recomendaciones. Se aplicará a todas las seleccionadas.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Dificultad</p>
              <ComplexityPicker value={complexity} onChange={setComplexity} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Energía</p>
              <EnergyPicker
                value={energyLevel}
                onChange={(level) =>
                  setEnergyLevel(energyLevel === level ? null : level)
                }
                size="sm"
              />
              <p className="text-xs text-muted-foreground">
                Vuelve a tocar el nivel elegido para dejarlo sin energía.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button
                onClick={() => onApply({ complexity, energyLevel })}
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
