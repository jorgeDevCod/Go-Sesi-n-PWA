"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { SubcategoryList } from "@/features/categories/components/SubcategoryList";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
import type { RoutineCategory } from "@/features/routine/components/RoutineTabs";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function ActivitiesTab({
  categories,
  itemsByCategory,
  initialCategoryId,
  activityBasePath,
  allowEdit = true,
}: {
  categories: RoutineCategory[];
  itemsByCategory: Record<string, SubcategoryItem[]>;
  initialCategoryId?: string | null;
  /** Ruta base de la vista (Personalizar o Actividades). */
  activityBasePath?: string;
  /** La vista standalone no permite editar actividades. */
  allowEdit?: boolean;
}) {
  const [selected, setSelected] = useState(() =>
    initialCategoryId && categories.some((category) => category.id === initialCategoryId)
      ? initialCategoryId
      : categories[0]?.id ?? "",
  );
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const current = categories.find((c) => c.id === selected) ?? categories[0];
  const normalizedQuery = normalizeSearch(search);

  const categoryResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return categories.filter(
      (category) =>
        normalizeSearch(category.name).includes(normalizedQuery) ||
        normalizeSearch(category.key ?? "").includes(normalizedQuery),
    );
  }, [categories, normalizedQuery]);

  const activityResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return categories.flatMap((category) =>
      (itemsByCategory[category.id] ?? [])
        .filter(
          (item) =>
            normalizeSearch(item.name).includes(normalizedQuery) ||
            normalizeSearch(category.name).includes(normalizedQuery),
        )
        .map((item) => ({ item, category })),
    );
  }, [categories, itemsByCategory, normalizedQuery]);

  useEffect(() => {
    if (!highlightId) return;
    const timer = window.setTimeout(() => setHighlightId(null), 4000);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  function selectCategory(categoryId: string, nextHighlightId: string | null = null) {
    setSelected(categoryId);
    setCategoriesOpen(false);
    setSearch("");
    setHighlightId(nextHighlightId);
    try {
      const url = activityBasePath
        ? `${activityBasePath}?categoria=${encodeURIComponent(categoryId)}`
        : ROUTES.activities(categoryId);
      window.history.replaceState(null, "", url);
    } catch {
      // Sin window (SSR) o historial no disponible.
    }
  }

  const hasQuery = normalizedQuery.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-3xl text-sm leading-relaxed text-pretty text-muted-foreground text-start">
        <p>Selecciona una categoría para desplegar sus actividades.</p>
        <span>
          Podrás cambiar de categoría sin volver al inicio y ajustar el tiempo justo antes de empezar.
        </span>
      </div>

      <div className="relative" role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar actividad o categoría..."
          aria-label="Buscar actividades o categorías"
          className="h-11 w-full rounded-2xl border border-border bg-surface pl-9 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        />
        {search.length > 0 && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {hasQuery ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              Resultados para “{search.trim()}”
            </p>
            <span className="text-xs text-muted-foreground">
              {categoryResults.length + activityResults.length}{" "}
              {categoryResults.length + activityResults.length === 1
                ? "coincidencia"
                : "coincidencias"}
            </span>
          </div>

          {categoryResults.length === 0 && activityResults.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
              No encontramos actividades ni categorías con ese nombre.
            </p>
          )}

          {categoryResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categorías
              </p>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                {categoryResults.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className="flex w-full cursor-pointer items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-aprender"
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${category.color}33`, color: category.color }}
                    >
                      <DynamicIcon name={category.icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {category.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">Categoría</span>
                    </span>
                    <ChevronDown className="size-4 shrink-0 -rotate-90 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activityResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actividades
              </p>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                {activityResults.map(({ item, category }) => (
                  <button
                    key={`${category.id}:${item.id}`}
                    type="button"
                    onClick={() => selectCategory(category.id, item.id)}
                    className="flex w-full cursor-pointer items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-aprender"
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${item.color}33`, color: item.color }}
                    >
                      <DynamicIcon name={item.icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {category.name} · {COMPLEXITY_LABELS[item.complexity]}
                      </span>
                    </span>
                    <ChevronDown className="size-4 shrink-0 -rotate-90 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div>
            <button
              type="button"
              onClick={() => setCategoriesOpen((value) => !value)}
              aria-expanded={categoriesOpen}
              aria-controls="activity-categories"
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <span>Cambiar de categoría</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  categoriesOpen && "rotate-180",
                )}
              />
            </button>

            {categoriesOpen && (
              <div id="activity-categories" className="mt-2 flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selected === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => selectCategory(category.id)}
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
                        <DynamicIcon
                          name={category.icon}
                          className="size-2.5"
                          style={{ color: category.color }}
                        />
                      </span>
                      {category.name}
                    </button>
                  );
                })}
              </div>
            )}
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
              allowEdit={allowEdit}
              enableBulkDelete
              highlightId={highlightId}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
              Crea primero una categoría en la pestaña &quot;Categorías&quot;.
            </p>
          )}
        </>
      )}
    </div>
  );
}
