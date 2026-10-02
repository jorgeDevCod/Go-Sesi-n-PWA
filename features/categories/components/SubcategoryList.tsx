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
import { Plus, Search, Trash2, CheckSquare, X } from "lucide-react";
import {
  deleteManySubcategoriesAction,
  reorderSubcategoriesAction,
} from "@/features/categories/actions/subcategory.actions";
import {
  useSubcategoryStore,
  type SubcategoryItem as SubcategoryItemType,
} from "@/features/categories/store/subcategory.store";
import { SubcategoryItem } from "@/features/categories/components/SubcategoryItem";
import { ActivityModal } from "@/features/categories/components/ActivityModal";
import { ActivityFilters } from "@/features/categories/components/ActivityFilters";
import { useHomeQuickStore } from "@/features/home/store/home-quick.store";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InfoModal } from "@/components/ui/InfoModal";
import { TRASH_RETENTION_DAYS } from "@/services/categories/trash.types";
import { cn } from "@/lib/utils";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";

type DeleteTarget =
  | { type: "selected" }
  | { type: "all" }
  | { type: "one"; id: string; name: string };

export function SubcategoryList({
  categoryId,
  categoryName,
  categoryIcon,
  categoryColor,
  categoryComplexity,
  initialItems,
  showFilters = true,
  showEnergyInModal = true,
  enableBulkDelete = false,
}: {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  categoryComplexity?: Complexity;
  initialItems: SubcategoryItemType[];
  showFilters?: boolean;
  showEnergyInModal?: boolean;
  enableBulkDelete?: boolean;
}) {
  const router = useRouter();
  const setItems = useSubcategoryStore((s) => s.setItems);
  const reorder = useSubcategoryStore((s) => s.reorder);
  const removeManyQuick = useHomeQuickStore((s) => s.removeMany);
  const items = useSubcategoryStore(
    (s) => s.itemsByCategory[categoryId] ?? initialItems,
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SubcategoryItemType | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [selectedEnergies, setSelectedEnergies] = useState<EnergyLevel[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Complexity[]>([]);
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [infoCount, setInfoCount] = useState(0);
  const previousOrderRef = useRef<SubcategoryItemType[] | null>(null);

  useEffect(() => {
    setItems(categoryId, initialItems);
  }, [categoryId, initialItems, setItems]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function cancelSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function runDelete(ids: string[]) {
    if (ids.length === 0) return;
    setIsDeleting(true);
    const result = await deleteManySubcategoriesAction({ ids });
    setIsDeleting(false);
    if (result.success) {
      removeManyQuick(ids);
      cancelSelectMode();
      setDeleteTarget(null);
      setInfoCount(ids.length);
      router.refresh();
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "one") {
      void runDelete([deleteTarget.id]);
      return;
    }
    if (deleteTarget.type === "selected") {
      void runDelete(Array.from(selectedIds));
      return;
    }
    void runDelete(items.map((item) => item.id));
  }

  const deleteModalCopy = (() => {
    if (!deleteTarget) return { title: "", message: "" };
    if (deleteTarget.type === "one") {
      return {
        title: `Eliminar "${deleteTarget.name}"`,
        message: "¿Estás seguro de que deseas eliminar esta actividad? Se moverá a la papelera.",
      };
    }
    if (deleteTarget.type === "all") {
      return {
        title: "Eliminar todas las actividades",
        message: `¿Estás seguro de que deseas eliminar las ${items.length} actividades de "${categoryName}"? Todas se moverán a la papelera.`,
      };
    }
    return {
      title: "Eliminar actividades seleccionadas",
      message: `¿Estás seguro de que deseas eliminar las ${selectedIds.size} actividades seleccionadas? Se moverán a la papelera.`,
    };
  })();

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

      {enableBulkDelete && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {selectMode ? (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeleteTarget({ type: "selected" })}
                disabled={selectedIds.size === 0}
                className={cn(
                  "gap-2",
                  selectedIds.size > 0 && "border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
                )}
              >
                <Trash2 className="size-4" />
                Eliminar seleccionadas ({selectedIds.size})
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={cancelSelectMode}
                className="gap-2"
              >
                <X className="size-4" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDeleteTarget({ type: "all" })}
                className="gap-2"
              >
                <Trash2 className="size-4" />
                Eliminar todo
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectMode(true)}
                className="gap-2"
              >
                <CheckSquare className="size-4" />
                Seleccionar y eliminar
              </Button>
            </>
          )}
        </div>
      )}

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
                selectMode={selectMode}
                selected={selectedIds.has(item.id)}
                onToggleSelect={toggleSelect}
                onEdit={() => setEditing(item)}
                onDelete={() => setDeleteTarget({ type: "one", id: item.id, name: item.name })}
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

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={deleteModalCopy.title}
        message={deleteModalCopy.message}
        variant="danger"
        confirmLabel="Sí, eliminar"
        isPending={isDeleting}
        onConfirm={confirmDelete}
      />

      <InfoModal
        open={infoCount > 0}
        onClose={() => setInfoCount(0)}
        title={infoCount === 1 ? "Actividad enviada a la papelera" : "Actividades enviadas a la papelera"}
        message={
          <>
            Puedes recuperarlas desde la <strong className="text-foreground">papelera</strong> cuando quieras.
            Tienes hasta <strong className="text-foreground">{TRASH_RETENTION_DAYS} días</strong> para
            restablecerlas; pasado ese plazo se eliminarán definitivamente.
          </>
        }
        confirmLabel="Entendido"
      />
    </div>
  );
}
