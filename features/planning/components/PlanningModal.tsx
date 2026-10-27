"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck2,
  Check,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconColorPicker, COLOR_SWATCHES } from "@/features/categories/components/IconColorPicker";
import { ComplexityPicker } from "@/components/ui/ComplexityPicker";
import { ICON_OPTIONS } from "@/lib/constants/icon-options";
import { createCategoryAction } from "@/features/categories/actions/category.actions";
import { ActivityModal } from "@/features/categories/components/ActivityModal";
import type { Complexity } from "@/lib/constants/default-subcategories";
import { cn } from "@/lib/utils";

export type PlanItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
  categoryId: string | null;
  subcategoryId: string | null;
};

export type PlanningSubcategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type PlanningCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: PlanningSubcategory[];
};

function isActivity(item: PlanItem): item is PlanItem & { subcategoryId: string } {
  return item.subcategoryId !== null;
}

export function PlanningModal({
  open,
  userName,
  categories,
  existingItems,
  onClose,
  onSave,
  onSkip,
  isPending,
}: {
  open: boolean;
  userName: string;
  categories: PlanningCategory[];
  existingItems: PlanItem[];
  onClose: () => void;
  onSave: (items: PlanItem[]) => void;
  onSkip: () => void;
  isPending: boolean;
}) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<PlanItem[]>(() =>
    existingItems.filter(isActivity),
  );
  const [localCategories, setLocalCategories] = useState<PlanningCategory[]>(categories);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id ?? "",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [creatingActivity, setCreatingActivity] = useState(false);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState<string>(ICON_OPTIONS[0]);
  const [newCatColor, setNewCatColor] = useState<string>(COLOR_SWATCHES[0]);
  const [newCatComplexity, setNewCatComplexity] = useState<Complexity>("MEDIUM");
  const [newCatError, setNewCatError] = useState<string | null>(null);
  const [isCreatingCat, startCreateCat] = useTransition();

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    const activities = existingItems.filter(isActivity);
    setSelectedItems(activities);
    const firstWithItems = categories.find((cat) =>
      activities.some((item) => item.categoryId === cat.id),
    );
    setActiveCategoryId(firstWithItems?.id ?? categories[0]?.id ?? "");
    setEditingId(null);
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

  const [prevCategories, setPrevCategories] = useState(categories);
  if (categories !== prevCategories) {
    setPrevCategories(categories);
    setLocalCategories(categories);
  }

  const categoryById = useMemo(
    () => new Map(localCategories.map((category) => [category.id, category])),
    [localCategories],
  );
  const selectedSubIds = useMemo(
    () => new Set(selectedItems.map((item) => item.subcategoryId).filter(Boolean)),
    [selectedItems],
  );
  const activeCategory = categoryById.get(activeCategoryId) ?? localCategories[0];

  if (typeof document === "undefined") return null;

  function selectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
  }

  function toggleActivity(category: PlanningCategory, sub: PlanningSubcategory) {
    setSelectedItems((prev) => {
      if (prev.some((item) => item.subcategoryId === sub.id)) {
        return prev.filter((item) => item.subcategoryId !== sub.id);
      }
      return [
        ...prev,
        {
          id: `temp-${sub.id}`,
          title: sub.name,
          icon: sub.icon,
          color: sub.color,
          categoryId: category.id,
          subcategoryId: sub.id,
        },
      ];
    });
    setEditingId(null);
  }

  function removeActivity(item: PlanItem) {
    setSelectedItems((prev) => prev.filter((selected) => selected.id !== item.id));
    if (editingId === item.id) setEditingId(null);
  }

  function startEdit(item: PlanItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
  }

  function saveEdit() {
    if (!editingId || !editTitle.trim()) return;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === editingId ? { ...item, title: editTitle.trim() } : item,
      ),
    );
    setEditingId(null);
  }

  function removeAll() {
    if (selectedItems.length === 0) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("¿Quitar todas las actividades de tu planificación?")
    ) {
      return;
    }
    setSelectedItems([]);
    setEditingId(null);
  }

  function handleActivityCreated(created: {
    id: string;
    name: string;
    icon: string;
    color: string;
    complexity: string;
    categoryId: string;
  }) {
    const category = categoryById.get(created.categoryId);
    if (!category) return;

    const newSub: PlanningSubcategory = {
      id: created.id,
      name: created.name,
      icon: created.icon,
      color: created.color,
    };

    setLocalCategories((prev) =>
      prev.map((cat) =>
        cat.id === created.categoryId
          ? { ...cat, subcategories: [...cat.subcategories, newSub] }
          : cat,
      ),
    );
    setActiveCategoryId(created.categoryId);
    setSelectedItems((prev) => {
      if (prev.some((item) => item.subcategoryId === created.id)) return prev;
      return [
        ...prev,
        {
          id: `temp-${created.id}`,
          title: created.name,
          icon: created.icon,
          color: created.color,
          categoryId: created.categoryId,
          subcategoryId: created.id,
        },
      ];
    });
    setCreatingActivity(false);
  }

  function handleAddCategory() {
    if (!newCatName.trim()) return;
    setNewCatError(null);
    startCreateCat(async () => {
      const result = await createCategoryAction({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
        complexity: newCatComplexity,
      });
      if (result.success) {
        const newCat: PlanningCategory = {
          id: result.category.id,
          name: result.category.name,
          icon: result.category.icon,
          color: result.category.color,
          subcategories: [],
        };
        setLocalCategories((prev) => [...prev, newCat]);
        setActiveCategoryId(newCat.id);
        setNewCatName("");
        setNewCatComplexity("MEDIUM");
        setShowNewCategory(false);
        router.refresh();
      } else {
        setNewCatError(result.error ?? "Error al crear la categoría.");
      }
    });
  }

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Planificación del día"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-xl"
          >
            {/* Header sticky: título + X siempre visible al hacer scroll. */}
            <div className="sticky top-0 z-20 flex items-start gap-3 border-b border-border bg-surface/95 p-5 backdrop-blur">
              <div className="min-w-0 flex-1 text-center">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  ¡Hola {userName}! ¿Qué haremos hoy?
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Elige una categoría, marca actividades y arma tu planificación.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                title="Cerrar sin guardar"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
              {/* Categorías */}
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Tus categorías</p>
                <div className="flex flex-wrap gap-2">
                  {localCategories.map((cat) => {
                    const active = activeCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => selectCategory(cat.id)}
                        aria-pressed={active}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                          active
                            ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                            : "border-border bg-surface-muted text-foreground hover:bg-surface-hover",
                        )}
                      >
                        <span
                          className="flex size-6 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${cat.color}33` }}
                        >
                          <DynamicIcon name={cat.icon} className="size-3.5" style={{ color: cat.color }} />
                        </span>
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crear nueva categoría */}
              <div>
                {!showNewCategory ? (
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-accent-aprender transition-colors duration-200 hover:text-accent-aprender-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                  >
                    <Plus className="size-3.5" />
                    Crear nueva categoría
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-muted p-4">
                    <p className="text-sm font-medium text-foreground">Crear nueva categoría</p>
                    <Input
                      value={newCatName}
                      onChange={(event) => setNewCatName(event.target.value)}
                      placeholder="Nombre de la categoría"
                      maxLength={40}
                    />
                    <ComplexityPicker value={newCatComplexity} onChange={setNewCatComplexity} />
                    <IconColorPicker
                      icon={newCatIcon}
                      onIconChange={setNewCatIcon}
                      color={newCatColor}
                      onColorChange={setNewCatColor}
                    />
                    {newCatError && (
                      <p className="text-sm text-red-500" role="alert">
                        {newCatError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="md"
                        onClick={handleAddCategory}
                        disabled={isCreatingCat || !newCatName.trim()}
                      >
                        {isCreatingCat ? "Creando..." : "Crear categoría"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="md"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCatError(null);
                        }}
                        disabled={isCreatingCat}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actividades de la categoría activa */}
              {activeCategory && (
                <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-muted p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actividades de {activeCategory.name}
                    </p>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">
                      {activeCategory.subcategories.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCategory.subcategories.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Esta categoría no tiene actividades todavía.
                      </p>
                    ) : (
                      activeCategory.subcategories.map((sub) => {
                        const selected = selectedSubIds.has(sub.id);
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => toggleActivity(activeCategory, sub)}
                            aria-pressed={selected}
                            className={cn(
                              "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                              selected
                                ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                                : "border-border bg-surface text-foreground hover:bg-surface-hover",
                            )}
                          >
                            <span
                              className="flex size-5 items-center justify-center rounded"
                              style={{ backgroundColor: `${sub.color}33` }}
                            >
                              <DynamicIcon name={sub.icon} className="size-3" style={{ color: sub.color }} />
                            </span>
                            {sub.name}
                            {selected && <Check className="size-3" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreatingActivity(true)}
                    className="flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent-aprender/40 hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                  >
                    <Plus className="size-3.5" />
                    Crear actividad personalizada
                  </button>
                </div>
              )}

              {/* Planificación única */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      Esta es tu Planificación
                    </p>
                    <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] text-muted-foreground">
                      {selectedItems.length}
                    </span>
                  </div>
                  {selectedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={removeAll}
                      className="flex cursor-pointer items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:border-red-900 dark:hover:bg-red-950"
                    >
                      <Trash2 className="size-3.5" />
                      Quitar todo
                    </button>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-muted p-6 text-center">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent-aprender/10 text-accent-aprender">
                      <CalendarCheck2 className="size-5" />
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      Aún no has elegido actividades
                    </p>
                    <p className="max-w-xs text-xs text-muted-foreground">
                      Toca una categoría, marca sus actividades y aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {selectedItems.map((item) => {
                      const category = item.categoryId
                        ? categoryById.get(item.categoryId)
                        : null;
                      const isEditing = editingId === item.id;
                      return (
                        <li
                          key={item.id}
                          className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5"
                        >
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${item.color}33` }}
                          >
                            <DynamicIcon name={item.icon} className="size-4" style={{ color: item.color }} />
                          </span>

                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editTitle}
                                  onChange={(event) => setEditTitle(event.target.value)}
                                  maxLength={40}
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                                <Button size="md" onClick={saveEdit} disabled={!editTitle.trim()}>
                                  <Check className="size-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <p className="truncate text-sm font-medium text-foreground">
                                  {item.title}
                                </p>
                                {category && (
                                  <span
                                    className="mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                    style={{
                                      backgroundColor: `${category.color}22`,
                                      color: category.color,
                                    }}
                                  >
                                    <DynamicIcon name={category.icon} className="size-2.5" />
                                    {category.name}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            aria-label="Editar actividad"
                            title="Editar actividad"
                            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeActivity(item)}
                            aria-label="Quitar actividad"
                            title="Quitar actividad"
                            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <Button
                  onClick={() => onSave(selectedItems)}
                  disabled={isPending || selectedItems.length === 0}
                  size="lg"
                  className="w-full"
                >
                  {isPending ? "Guardando..." : "Guardar planificación"}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onSkip}
                  disabled={isPending}
                  className="gap-2"
                >
                  <HelpCircle className="size-4" />
                  Prefiero que me recomiendes algo
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      <ActivityModal
        open={creatingActivity}
        categoryId={activeCategory?.id}
        categoryName={activeCategory?.name}
        onClose={() => setCreatingActivity(false)}
        onSaved={() => router.refresh()}
        onCreated={handleActivityCreated}
      />
    </>,
    document.body,
  );
}
