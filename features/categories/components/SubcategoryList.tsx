"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Search } from "lucide-react";
import {
  deleteSubcategoryAction,
  reorderSubcategoriesAction,
} from "@/features/categories/actions/subcategory.actions";
import {
  useSubcategoryStore,
  type SubcategoryItem as SubcategoryItemType,
} from "@/features/categories/store/subcategory.store";
import { SubcategoryItem } from "@/features/categories/components/SubcategoryItem";
import { ActivityModal } from "@/features/categories/components/ActivityModal";
import { ActivityFilters } from "@/features/categories/components/ActivityFilters";
import { Button } from "@/components/ui/Button";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";

export function SubcategoryList({
  categoryId,
  categoryName,
  categoryIcon,
  categoryColor,
  categoryComplexity,
  initialItems,
  showFilters = true,
  showEnergyInModal = true,
}: {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  categoryComplexity?: Complexity;
  initialItems: SubcategoryItemType[];
  showFilters?: boolean;
  showEnergyInModal?: boolean;
}) {
  const router = useRouter();
  const setItems = useSubcategoryStore((s) => s.setItems);
  const reorder = useSubcategoryStore((s) => s.reorder);
  const items = useSubcategoryStore(
    (s) => s.itemsByCategory[categoryId] ?? initialItems,
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SubcategoryItemType | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [selectedEnergies, setSelectedEnergies] = useState<EnergyLevel[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Complexity[]>([]);
  const [search, setSearch] = useState("");
  const previousOrderRef = useRef<SubcategoryItemType[] | null>(null);

  useEffect(() => {
    setItems(categoryId, initialItems);
  }, [categoryId, initialItems, setItems]);

  const filteredItems = items.filter((item) => {
    const energyMatch =
      selectedEnergies.length === 0 ||
      (item.energyLevel !== null && item.energyLevel !== undefined &&
        selectedEnergies.includes(item.energyLevel));
    const difficultyMatch =
      selectedDifficulties.length === 0 || selectedDifficulties.includes(item.complexity);
    const searchMatch =
      search.trim().length === 0 ||
      item.name.toLowerCase().includes(search.trim().toLowerCase());
    return energyMatch && difficultyMatch && searchMatch;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = items.map((item) => item.id);
    const fromIndex = ids.indexOf(String(active.id));
    const toIndex = ids.indexOf(String(over.id));
    if (fromIndex === -1 || toIndex === -1) return;

    previousOrderRef.current = items;
    const reorderedIds = reorder(categoryId, fromIndex, toIndex);
    setReorderError(null);

    const result = await reorderSubcategoriesAction({ categoryId, orderedIds: reorderedIds });
    if (!result.success && previousOrderRef.current) {
      setItems(categoryId, previousOrderRef.current);
      setReorderError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {showFilters && (
        <ActivityFilters
          selectedEnergies={selectedEnergies}
          selectedDifficulties={selectedDifficulties}
          onToggleEnergy={(level) =>
            setSelectedEnergies((prev) =>
              prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
            )
          }
          onToggleDifficulty={(value) =>
            setSelectedDifficulties((prev) =>
              prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
            )
          }
        />
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar actividad..."
          aria-label="Buscar actividad"
          className="h-11 w-full rounded-2xl border border-border bg-surface pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <SubcategoryItem
                key={item.id}
                item={item}
                category={{
                  id: categoryId,
                  name: categoryName,
                  icon: categoryIcon ?? "Folder",
                  color: categoryColor ?? "#6366F1",
                }}
                onEdit={() => setEditing(item)}
                onDelete={() => {
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm(`¿Eliminar "${item.name}"?`)
                  ) {
                    return;
                  }
                  void deleteSubcategoryAction({ id: item.id }).then((result) => {
                    if (result.success) router.refresh();
                  });
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {reorderError && (
        <p className="text-sm text-red-500" role="alert">
          {reorderError}
        </p>
      )}

      {filteredItems.length === 0 && !createOpen && (
        <p className="rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
          {selectedEnergies.length > 0 || selectedDifficulties.length > 0
            ? "No hay actividades que coincidan con estos filtros. Prueba con otra energía o dificultad."
            : "Todavía no tienes Actividades aquí. Agrega la primera cuando quieras."}
        </p>
      )}

      <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.08 }}>
        <Button variant="secondary" onClick={() => setCreateOpen(true)} className="self-start">
          <Plus className="size-4" />
          Agregar Actividad
        </Button>
      </motion.div>

      <ActivityModal
        open={createOpen}
        categoryId={categoryId}
        categoryName={categoryName}
        categoryComplexity={categoryComplexity}
        onClose={() => setCreateOpen(false)}
        onSaved={() => router.refresh()}
        showEnergy={showEnergyInModal}
      />

      <ActivityModal
        open={Boolean(editing)}
        categoryId={categoryId}
        categoryName={categoryName}
        initial={editing}
        onClose={() => setEditing(null)}
        onSaved={() => router.refresh()}
        showEnergy={showEnergyInModal}
      />
    </div>
  );
}
