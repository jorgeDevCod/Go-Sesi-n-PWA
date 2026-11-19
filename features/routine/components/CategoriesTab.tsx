"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckSquare, Pencil, Plus, Trash2, X } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InfoModal } from "@/components/ui/InfoModal";
import { CategoryModal } from "@/features/categories/components/CategoryModal";
import {
  BulkEditModal,
  type BulkEditValues,
} from "@/features/categories/components/BulkEditModal";
import {
  bulkUpdateCategoriesAction,
  updateCategoryAction,
} from "@/features/categories/actions/category.actions";
import { deleteCategoryAction } from "@/features/categories/actions/category.actions";
import { createCategoryAction } from "@/features/categories/actions/category.actions";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
import { TRASH_RETENTION_DAYS } from "@/services/categories/trash.types";
import { cn } from "@/lib/utils";
import type { RoutineCategory } from "@/features/routine/components/RoutineTabs";

export function CategoriesTab({ categories }: { categories: RoutineCategory[] }) {
  const router = useRouter();
  const [list, setList] = useState(categories);
  const [editCategory, setEditCategory] = useState<RoutineCategory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<RoutineCategory | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [blockedCategory, setBlockedCategory] = useState<RoutineCategory | null>(null);
  const [bulkTarget, setBulkTarget] = useState<"selected" | null>(null);
  const [infoCount, setInfoCount] = useState(0);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditError, setBulkEditError] = useState<string | null>(null);
  const [isBulkEditing, startBulkEdit] = useTransition();

  const isModalOpen = editCategory !== null || showCreateModal;
  const allSelected =
    list.length > 0 && list.every((category) => selectedIds.has(category.id));
  const bulkRequiresPassword = list
    .filter((category) => selectedIds.has(category.id))
    .some((category) => category.isDefault);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (list.length > 0 && list.every((category) => prev.has(category.id))) {
        return new Set();
      }
      return new Set(list.map((category) => category.id));
    });
  }

  function cancelSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
    setBulkEditOpen(false);
    setBulkEditError(null);
  }

  async function runDeleteCats(ids: string[]) {
    setDeleteError(null);
    startDelete(async () => {
      const deletedIds: string[] = [];
      for (const id of ids) {
        const cat = list.find((c) => c.id === id);
        if (!cat) continue;
        const result = await deleteCategoryAction({
          id,
          password: cat.isDefault ? deletePassword : undefined,
        });
        if (!result.success) {
          // Si la categoría no está vacía, se muestra el modal informativo y se detiene.
          setBlockedCategory(cat);
          break;
        }
        deletedIds.push(id);
        setList((prev) => prev.filter((c) => c.id !== id));
      }
      if (deletedIds.length > 0) {
        cancelSelectMode();
        setDeletePassword("");
        setBulkTarget(null);
        setInfoCount(deletedIds.length);
        router.refresh();
      }
    });
  }

  function deleteSelected() {
    if (selectedIds.size === 0) return;
    setBulkTarget("selected");
  }

  function confirmBulkDelete() {
    if (!bulkTarget) return;
    void runDeleteCats(Array.from(selectedIds));
  }

  function applyBulkEdit(values: BulkEditValues) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkEditError(null);
    startBulkEdit(async () => {
      const result = await bulkUpdateCategoriesAction({
        ids,
        complexity: values.complexity,
        energyLevel: values.energyLevel,
        energyComplexity: values.complexity,
      });
      if (!result.success) {
        setBulkEditError(result.error);
        return;
      }
      setList((prev) =>
        prev.map((category) =>
          selectedIds.has(category.id)
            ? { ...category, complexity: values.complexity }
            : category,
        ),
      );
      cancelSelectMode();
      router.refresh();
    });
  }

  function executeDelete() {
    const cat = confirmingDelete;
    if (!cat) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteCategoryAction({
        id: cat.id,
        password: cat.isDefault ? deletePassword : undefined,
      });
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      setList((prev) => prev.filter((c) => c.id !== cat.id));
      setConfirmingDelete(null);
      setDeletePassword("");
      setInfoCount(1);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Crea categorías para enfocarte en lo que quieres mejorar, organizar tus actividades o dedicarte a tus nuevos hobbies. Personaliza cada una y hazla completamente tuya.
      </p>

      {list.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {selectMode ? (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={toggleSelectAll}
                className="gap-2"
              >
                <CheckSquare className="size-4" />
                {allSelected ? "Quitar selección" : "Seleccionar todas"}
              </Button>
              {selectedIds.size > 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setBulkEditError(null);
                    setBulkEditOpen(true);
                  }}
                  className="gap-2"
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
              )}
              {selectedIds.size > 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={deleteSelected}
                  className="gap-2 border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </Button>
              )}
              <Button variant="ghost" size="md" onClick={cancelSelectMode} className="gap-2">
                <X className="size-4" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setSelectMode(true)}
              className="gap-2"
            >
              <CheckSquare className="size-4" />
              Seleccionar
            </Button>
          )}
        </div>
      )}

      {!selectMode && (
        <Button
          size="md"
          onClick={() => setShowCreateModal(true)}
          className="w-fit gap-2"
        >
          <Plus className="size-4" />
          Crear categoría
        </Button>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no tienes categorías. Crea la primera con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((category) => {
            const selected = selectedIds.has(category.id);
            return (
            <div
              key={category.id}
              onClick={selectMode ? () => toggleSelect(category.id) : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-surface p-4 transition-all duration-200",
                selectMode ? "cursor-pointer" : "border-border shadow-sm",
                selectMode && selected && "border-red-400 bg-red-50 ring-2 ring-red-300 dark:bg-red-950/40 dark:ring-red-700",
                selectMode && !selected && "border-dashed border-border",
              )}
            >
              {selectMode && (
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected ? "border-red-500 bg-red-500 text-white" : "border-border bg-surface text-transparent",
                  )}
                >
                  <Check className="size-4" />
                </span>
              )}
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${category.color}33`, color: category.color }}
              >
                <DynamicIcon name={category.icon} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  Dificultad: {COMPLEXITY_LABELS[category.complexity]}
                </p>
              </div>
              {!selectMode && (
              <>
              <button
                type="button"
                onClick={() => setEditCategory(category)}
                aria-label={`Editar categoría ${category.name}`}
                title={`Editar ${category.name}`}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(category);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                aria-label={`Eliminar categoría ${category.name}`}
                title={`Eliminar ${category.name}`}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950"
              >
                <Trash2 className="size-4" />
              </button>
              </>
              )}
            </div>
            );
          })}
        </div>
      )}

      <BulkEditModal
        open={bulkEditOpen}
        count={selectedIds.size}
        itemLabel="categorías"
        isPending={isBulkEditing}
        error={bulkEditError}
        onClose={() => setBulkEditOpen(false)}
        onApply={applyBulkEdit}
      />

      <CategoryModal
        open={isModalOpen}
        initial={editCategory}
        onSubmit={(values) => {
          if (editCategory) {
            return updateCategoryAction({ id: editCategory.id, ...values }).then((result) => {
              if (result.success) {
                setList((prev) =>
                  prev.map((c) => (c.id === editCategory.id ? { ...c, ...values } : c)),
                );
                router.refresh();
              }
              return result;
            });
          }
          return createCategoryAction(values).then((result) => {
            if (result.success) {
              setList((prev) => [
                ...prev,
                {
                  id: result.category.id,
                  key: result.category.key ?? null,
                  name: result.category.name,
                  icon: result.category.icon,
                  color: result.category.color,
                  isDefault: false,
                  complexity: result.category.complexity,
                },
              ]);
              router.refresh();
            }
            return result;
          });
        }}
        onSaved={() => router.refresh()}
        onClose={() => {
          setEditCategory(null);
          setShowCreateModal(false);
        }}
      />

      <ConfirmModal
        open={confirmingDelete !== null}
        onClose={() => {
          setConfirmingDelete(null);
          setDeletePassword("");
          setDeleteError(null);
        }}
        title={`Eliminar "${confirmingDelete?.name ?? ""}"`}
        message={
          confirmingDelete?.isDefault
            ? "Esta es una categoría principal de Go Sesión. Escribe tu contraseña para eliminarla."
            : "¿Estás seguro de que deseas eliminar esta categoría? Se eliminarán también sus actividades."
        }
        variant="danger"
        requirePassword={confirmingDelete?.isDefault ?? false}
        isPending={isDeleting}
        error={deleteError}
        password={deletePassword}
        onPasswordChange={setDeletePassword}
        onConfirm={executeDelete}
      />

      <ConfirmModal
        open={blockedCategory !== null}
        onClose={() => setBlockedCategory(null)}
        title={`No se pudo eliminar "${blockedCategory?.name ?? ""}"`}
        message="Esta categoría contiene actividades. Para eliminar una categoría, primero elimina todas sus actividades (se van a la papelera) o muévelas a otra. Una categoría solo se elimina si está completamente vacía."
        variant="danger"
        onConfirm={() => setBlockedCategory(null)}
        confirmLabel="Entendido"
        cancelLabel="Cerrar"
      />

      <ConfirmModal
        open={bulkTarget !== null}
        onClose={() => {
          setBulkTarget(null);
          setDeletePassword("");
          setDeleteError(null);
        }}
        title="Eliminar categorías seleccionadas"
        message={`¿Estás seguro de que deseas eliminar las ${selectedIds.size} categorías seleccionadas? Se moverán a la papelera.`}
        variant="danger"
        confirmLabel="Sí, eliminar"
        isPending={isDeleting}
        requirePassword={bulkRequiresPassword}
        password={deletePassword}
        onPasswordChange={setDeletePassword}
        error={deleteError}
        onConfirm={confirmBulkDelete}
      />

      <InfoModal
        open={infoCount > 0}
        onClose={() => setInfoCount(0)}
        title={infoCount === 1 ? "Categoría enviada a la papelera" : "Categorías enviadas a la papelera"}
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
