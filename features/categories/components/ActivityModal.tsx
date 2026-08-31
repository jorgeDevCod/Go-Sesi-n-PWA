"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { IconColorPicker, COLOR_SWATCHES } from "@/features/categories/components/IconColorPicker";
import { ICON_OPTIONS } from "@/lib/constants/icon-options";
import type { EnergyLevel } from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";
import {
  createSubcategoryAction,
  updateSubcategoryAction,
} from "@/features/categories/actions/subcategory.actions";
import { EnergyPicker } from "@/components/ui/EnergyPicker";
import { cn } from "@/lib/utils";

const COMPLEXITY_OPTIONS: { value: Complexity; label: string; hint: string }[] = [
  { value: "LOW", label: "Baja", hint: "Ligera" },
  { value: "MEDIUM", label: "Media", hint: "Moderada" },
  { value: "HIGH", label: "Alta", hint: "Intensa" },
];

export type ActivityModalCategory = {
  id: string;
  name: string;
  complexity?: Complexity;
};

export type ActivityModalInitial = {
  id: string;
  name: string;
  icon: string;
  color: string;
  complexity: Complexity;
  energyLevel?: EnergyLevel | null;
  energyComplexity?: Complexity | null;
};

export type CreatedSubcategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  complexity: string;
  categoryId: string;
};

export type ActivityModalSubmit = (
  values: {
    name: string;
    icon: string;
    color: string;
    complexity: Complexity;
    energyLevel?: EnergyLevel | null;
    energyComplexity?: Complexity | null;
  },
  meta: { categoryId: string | null },
) => Promise<{ success: boolean; error?: string }>;

export function ActivityModal({
  open,
  onClose,
  onSaved,
  onCreated,
  onSubmit,
  categoryId,
  categoryName,
  categoryComplexity,
  categories,
  initial,
  showEnergy = true,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onCreated?: (subcategory: CreatedSubcategory) => void;
  onSubmit?: ActivityModalSubmit;
  categoryId?: string;
  categoryName?: string;
  categoryComplexity?: Complexity;
  categories?: ActivityModalCategory[];
  initial?: ActivityModalInitial | null;
  showEnergy?: boolean;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [color, setColor] = useState<string>(COLOR_SWATCHES[0]);
  const [complexity, setComplexity] = useState<Complexity>("MEDIUM");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [energyComplexity, setEnergyComplexity] = useState<Complexity | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setName(initial?.name ?? "");
    setIcon(initial?.icon ?? ICON_OPTIONS[0]);
    setColor(initial?.color ?? COLOR_SWATCHES[0]);
    setComplexity(initial?.complexity ?? categoryComplexity ?? "MEDIUM");
    setEnergyLevel(initial?.energyLevel ?? null);
    setEnergyComplexity(initial?.energyComplexity ?? null);
    setSelectedCategoryId(null);
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
  const resolvedCategoryId = categoryId ?? selectedCategoryId;
  const resolvedCategoryName = categoryName ?? categories?.find((c) => c.id === selectedCategoryId)?.name;

  const needsCategoryStep = !isEditing && !categoryId && !selectedCategoryId;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isEditing && !resolvedCategoryId && !onSubmit) return;
    setError(null);

    startTransition(async () => {
      const resolvedEnergyLevel = showEnergy ? energyLevel : null;
      const resolvedEnergyComplexity = showEnergy ? energyComplexity : null;

      if (onSubmit) {
        const result = await onSubmit(
          { name, icon, color, complexity, energyLevel: resolvedEnergyLevel, energyComplexity: resolvedEnergyComplexity },
          { categoryId: resolvedCategoryId ?? null },
        );
        if (!result.success) {
          setError(result.error ?? "No se pudo guardar. Intenta de nuevo.");
          return;
        }
        onSaved();
        onClose();
        return;
      }

      if (isEditing) {
        const result = await updateSubcategoryAction({
          id: initial!.id,
          name,
          icon,
          color,
          complexity,
          energyLevel: resolvedEnergyLevel,
          energyComplexity: resolvedEnergyComplexity,
        });
        if (!result.success) {
          setError(result.error ?? "No se pudo guardar. Intenta de nuevo.");
          return;
        }
        onSaved();
        onClose();
        return;
      }

      const result = await createSubcategoryAction({
        categoryId: resolvedCategoryId!,
        name,
        icon,
        color,
        complexity,
        energyLevel: resolvedEnergyLevel,
        energyComplexity: resolvedEnergyComplexity,
      });
      if (!result.success) {
        setError(result.error ?? "No se pudo guardar. Intenta de nuevo.");
        return;
      }
      onCreated?.(result.subcategory);
      onSaved();
      onClose();
    });
  }

  const title = isEditing
    ? `Editar ${initial!.name}`
    : needsCategoryStep
      ? "Crear nueva actividad"
      : "Nueva actividad";

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
              <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isEditing
                  ? "Actualiza los datos de la actividad"
                  : resolvedCategoryName
                    ? `Esta nueva actividad se agregará a ${resolvedCategoryName}`
                    : "Elige la categoría y completa los datos"}
              </p>
            </div>

            {needsCategoryStep ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">Paso 1: Elige una categoría</p>
                <div className="flex flex-wrap gap-2">
                  {(categories ?? []).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        if (cat.complexity) setComplexity(cat.complexity);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                        selectedCategoryId === cat.id
                          ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                          : "border-border bg-surface-muted text-foreground hover:bg-surface-hover",
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                {!selectedCategoryId && (
                  <p className="text-xs text-muted-foreground">
                    Si no encuentras la categoría, agrégala primero en &quot;Tus Actividades&quot;.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {!isEditing && selectedCategoryId && (
                  <p className="text-sm font-medium text-foreground">
                    Paso 2: Crea tu próxima actividad para esta categoría
                  </p>
                )}
                {!isEditing && categoryName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Categoría</span>
                    <ChevronRight className="size-3" />
                    <span className="font-medium text-foreground">{categoryName}</span>
                  </div>
                )}

                <div>
                  <Label htmlFor="activity-name">Nombre</Label>
                  <Input
                    id="activity-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={40}
                    placeholder="ej: Leer 20 páginas"
                    required
                  />
                </div>

                <div>
                  <Label>Dificultad</Label>
                  <p className="mt-1.5 text-xs text-muted-foreground mb-2">
                    Define la dificultad para obtener recomendaciones más acertadas según tu energia.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {COMPLEXITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setComplexity(option.value)}
                        aria-pressed={complexity === option.value}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 font-work transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                          complexity === option.value
                            ? "border-accent-aprender bg-accent-aprender/5 ring-1 ring-accent-aprender"
                            : "border-border bg-surface-muted hover:bg-surface-hover",
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            complexity === option.value ? "text-accent-aprender" : "text-foreground",
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{option.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {showEnergy && (
                  <div>
                    <Label>Energía</Label>
                    <p className="mt-1 text-xs text-muted-foreground mb-2">
                      Define el Nivel de energía que mejor se te acomoda para esta actividad.
                    </p>
                    <EnergyPicker
                      value={energyLevel}
                      onChange={(level) => setEnergyLevel(energyLevel === level ? null : level)}
                      size="sm"
                    />
                  </div>
                )}

                <IconColorPicker
                  icon={icon}
                  onIconChange={setIcon}
                  color={color}
                  onColorChange={setColor}
                />

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
                      "Crear actividad"
                    )}
                  </Button>
                  <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
