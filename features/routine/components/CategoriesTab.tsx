"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { CategoryModal } from "@/features/categories/components/CategoryModal";
import { updateCategoryAction } from "@/features/categories/actions/category.actions";
import { deleteCategoryAction } from "@/features/categories/actions/category.actions";
import { createCategoryAction } from "@/features/categories/actions/category.actions";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
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

  const isModalOpen = editCategory !== null || showCreateModal;

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
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Crea categorías para enfocarte en lo que quieres mejorar, organizar tus actividades o dedicarte a tus nuevos hobbies. Personaliza cada una y hazla completamente tuya.
      </p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center">
          <p className="text-sm text-muted-foreground">Aún no tienes categorías. Crea la primera:</p>
          <Button size="md" onClick={() => setShowCreateModal(true)}>
            <Plus className="size-4" />
            Crear categoría
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
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
            </div>
          ))}
        </div>
      )}

      {list.length > 0 && (
        <div className="flex justify-center">
          <Button size="md" onClick={() => setShowCreateModal(true)} variant="secondary">
            <Plus className="size-4" />
            Crear categoría
          </Button>
        </div>
      )}

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
    </div>
  );
}
