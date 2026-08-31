"use client";

import { useState } from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { SubcategoryList } from "@/features/categories/components/SubcategoryList";
import { cn } from "@/lib/utils";
import type { RoutineCategory } from "@/features/routine/components/RoutineTabs";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";

export function ActivitiesTab({
  categories,
  itemsByCategory,
}: {
  categories: RoutineCategory[];
  itemsByCategory: Record<string, SubcategoryItem[]>;
}) {
  const [selected, setSelected] = useState(categories[0]?.id ?? "");
  const current = categories.find((c) => c.id === selected) ?? categories[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm leading-relaxed text-muted-foreground text-center">
        <p>
          Selecciona una categoría para ver sus actividades.
        </p>
        <span>
          Aquí puedes crear, editar, reordenar o
          eliminar tus actividades con las que luego armarás tus sesiones de enfoque.
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selected === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelected(category.id)}
              aria-pressed={isSelected}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                isSelected
                  ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              <span
                className="flex size-4 items-center justify-center rounded"
                style={{ backgroundColor: `${category.color}33` }}
              >
                <DynamicIcon name={category.icon} className="size-2.5" style={{ color: category.color }} />
              </span>
              {category.name}
            </button>
          );
        })}
      </div>

      {current ? (
          <SubcategoryList
            key={current.id}
            categoryId={current.id}
            categoryName={current.name}
            categoryIcon={current.icon}
            categoryColor={current.color}
            categoryComplexity={current.complexity}
            initialItems={itemsByCategory[current.id] ?? []}
            showFilters={false}
          />
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
          Crea primero una categoría en la pestaña &quot;Categorías&quot;.
        </p>
      )}
    </div>
  );
}
