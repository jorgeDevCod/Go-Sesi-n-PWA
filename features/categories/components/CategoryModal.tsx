"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ComplexityPicker } from "@/components/ui/ComplexityPicker";
import { EnergyPicker } from "@/components/ui/EnergyPicker";
import { IconColorPicker, COLOR_SWATCHES } from "@/features/categories/components/IconColorPicker";
import { ICON_OPTIONS } from "@/lib/constants/icon-options";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/features/categories/actions/category.actions";

export type CategoryModalInitial = {
  id: string;
  name: string;
  icon: string;
  color: string;
  complexity: Complexity;
  energyLevel?: EnergyLevel | null;
  energyComplexity?: Complexity | null;
};

export function CategoryModal({
  open,
  onClose,
  onSaved,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSubmit?: (values: { name: string; icon: string; color: string; complexity: Complexity; energyLevel?: EnergyLevel | null; energyComplexity?: Complexity | null }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  initial?: CategoryModalInitial | null;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [color, setColor] = useState<string>(COLOR_SWATCHES[0]);
  const [complexity, setComplexity] = useState<Complexity>("MEDIUM");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [energyComplexity, setEnergyComplexity] = useState<Complexity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setName(initial?.name ?? "");
    setIcon(initial?.icon ?? ICON_OPTIONS[0]);
    setColor(initial?.color ?? COLOR_SWATCHES[0]);
    setComplexity(initial?.complexity ?? "MEDIUM");
    setEnergyLevel(initial?.energyLevel ?? null);
    setEnergyComplexity(initial?.energyComplexity ?? null);
    setError(null);
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

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const isEditing = Boolean(initial);
  const title = isEditing ? `Editar ${initial!.name}` : "Crear categoría";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = onSubmit
        ? await onSubmit({ name, icon, color, complexity, energyLevel, energyComplexity })
        : isEditing
          ? await updateCategoryAction({ id: initial!.id, name, icon, color, complexity, energyLevel, energyComplexity })
          : await createCategoryAction({ name, icon, color, complexity, energyLevel, energyComplexity });
      if (!result.success) {
        setError(result.error ?? "No se pudo guardar. Intenta de nuevo.");
        return;
      }
      onSaved();
      onClose();
    });
  }

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
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar sin guardar"
              className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <X className="size-4" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isEditing
                  ? "Actualiza el nombre, icono, color o dificultad"
                  : "Crea una nueva categoría para tus actividades"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="category-name">Nombre de la categoría</Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  required
                />
              </div>

              <div>
                <Label>Dificultad</Label>
                <ComplexityPicker
                  value={complexity}
                  onChange={setComplexity}
                  hint="Selecciona una dificultad para que el algoritmo pueda brindarte recomendaciones personalizadas según tu energía."
                />
              </div>

              <div>
                <Label>Energía</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nivel de energía preferido para esta categoría en las recomendaciones.
                </p>
                <EnergyPicker
                  value={energyLevel}
                  onChange={(level) => setEnergyLevel(energyLevel === level ? null : level)}
                  size="sm"
                />
              </div>

              <IconColorPicker icon={icon} onIconChange={setIcon} color={color} onColorChange={setColor} />

              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending || name.trim().length === 0}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Guardando...
                    </>
                  ) : isEditing ? (
                    "Guardar cambios"
                  ) : (
                    "Crear categoría"
                  )}
                </Button>
                <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                  Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
