"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ICON_OPTIONS } from "@/lib/constants/icon-options";
import { IconColorPicker, COLOR_SWATCHES } from "@/features/categories/components/IconColorPicker";
import { ComplexityPicker } from "@/components/ui/ComplexityPicker";
import type { Complexity } from "@/lib/constants/default-subcategories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export type CategoryFormValues = {
  name: string;
  icon: string;
  color: string;
  complexity: Complexity;
};

export function CategoryForm({
  onSubmit,
  onCancel,
  submitLabel = "Crear Nueva categoría",
}: {
  onSubmit: (values: CategoryFormValues) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);
  const [color, setColor] = useState<string>(COLOR_SWATCHES[0]);
  const [complexity, setComplexity] = useState<Complexity>("MEDIUM");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({ name, icon, color, complexity });
      if (!result.success) {
        setError(result.error ?? "No se pudo guardar. Intenta de nuevo.");
      }
    });
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-muted p-4"
    >
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
        <ComplexityPicker value={complexity} onChange={setComplexity} />
      </div>

      <IconColorPicker icon={icon} onIconChange={setIcon} color={color} onColorChange={setColor} />

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || name.trim().length === 0}>
          {isPending ? "Guardando..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </motion.form>
  );
}
