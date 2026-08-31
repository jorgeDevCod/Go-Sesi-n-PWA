"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CategoryModal } from "@/features/categories/components/CategoryModal";
import { createCategoryAction } from "@/features/categories/actions/category.actions";
import type { Complexity } from "@/lib/constants/default-subcategories";

export type CreatedCategory = {
  id: string;
  key: string | null;
  name: string;
  icon: string;
  color: string;
  complexity: Complexity;
};

/**
 * Always rendered last by the parent (CategoryTabs / CategoryHomeGrid),
 * regardless of how many categories already exist-an eye-catching, fixed
 * "add" affordance that never gets displaced.
 */
export function CreateCategoryCard({
  onCreated,
  variant = "pill",
}: {
  onCreated: (category: CreatedCategory) => void;
  variant?: "pill" | "card";
}) {
  const [open, setOpen] = useState(false);

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Crear Nueva categoría"
        className="flex min-h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-surface p-5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-indigo-400 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
          <Plus className="size-5" />
        </span>
        Crear Nueva categoría
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Crear Nueva categoría"
        className="flex cursor-pointer items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
      >
        <Plus className="size-4" />
        Crear Nueva categoría
      </button>
      <CategoryModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => setOpen(false)}
        onSubmit={async (values) => {
          const result = await createCategoryAction({
            name: values.name,
            icon: values.icon,
            color: values.color,
            complexity: values.complexity,
          });
          if (result.success) {
            onCreated(result.category);
            return { success: true };
          }
          return { success: false, error: result.error };
        }}
      />
    </>
  );
}
