"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Check, Trash2, HelpCircle, ChevronDown, CalendarCheck2 } from "lucide-react";
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
  const [selectedItems, setSelectedItems] = useState<PlanItem[]>(existingItems);
  const [localCategories, setLocalCategories] = useState<PlanningCategory[]>(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [creatingForCategoryId, setCreatingForCategoryId] = useState<string | null>(null);

  // New category state
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState<string>(ICON_OPTIONS[0]);
  const [newCatColor, setNewCatColor] = useState<string>(COLOR_SWATCHES[0]);
  const [newCatComplexity, setNewCatComplexity] = useState<Complexity>("MEDIUM");
  const [newCatError, setNewCatError] = useState<string | null>(null);
  const [isCreatingCat, startCreateCat] = useTransition();

  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("");

  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setSelectedItems(existingItems);
    setExpandedCatId(null);
    setExpandedGroupId(null);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Sync localCategories with the prop only when it changes (derived state,
  // no setState inside an effect). Local edits (new activities) are preserved
  // unless the parent actually passes a new categories array.
  const [prevCategories, setPrevCategories] = useState(categories);
  if (categories !== prevCategories) {
    setPrevCategories(categories);
    setLocalCategories(categories);
  }

  const grouped = useMemo(() => {
    const groups = new Map<string, { category: PlanningCategory; items: PlanItem[] }>();
    for (const category of localCategories) {
      groups.set(category.id, { category, items: [] });
    }
    for (const item of selectedItems) {
      if (item.categoryId) {
        const group = groups.get(item.categoryId);
        if (group) group.items.push(item);
        else groups.set(item.categoryId, { category: { id: item.categoryId, name: item.title, icon: item.icon, color: item.color, subcategories: [] }, items: [item] });
      }
    }
    return [...groups.values()].filter((group) =>
      group.items.some((item) => item.subcategoryId !== null),
    );
  }, [selectedItems, localCategories]);

  function toggleCategory(cat: PlanningCategory) {
    const turningOn = !isSelected(cat.id);
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.categoryId === cat.id);
      if (exists) {
        return prev.filter((item) => item.categoryId !== cat.id);
      }
      return [
        ...prev,
        {
          id: `temp-${cat.id}`,
          title: cat.name,
          icon: cat.icon,
          color: cat.color,
          categoryId: cat.id,
          subcategoryId: null,
        },
      ];
    });
    setExpandedCatId((prev) =>
      turningOn ? cat.id : prev === cat.id ? null : prev,
    );
    setExpandedGroupId((prev) =>
      turningOn ? cat.id : prev === cat.id ? null : prev,
    );
  }

  function isSelected(catId: string) {
    return selectedItems.some((item) => item.categoryId === catId);
  }

  function toggleActivity(cat: PlanningCategory, sub: PlanningSubcategory) {
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.subcategoryId === sub.id);
      if (exists) {
        return prev.filter((item) => item.subcategoryId !== sub.id);
      }
      const hasCategory = prev.some((item) => item.categoryId === cat.id);
      const base: PlanItem[] = hasCategory
        ? prev
        : [
            ...prev,
            {
              id: `temp-${cat.id}`,
              title: cat.name,
              icon: cat.icon,
              color: cat.color,
              categoryId: cat.id,
              subcategoryId: null,
            },
          ];
      return [
        ...base,
        {
          id: `temp-${sub.id}`,
          title: sub.name,
          icon: sub.icon,
          color: sub.color,
          categoryId: cat.id,
          subcategoryId: sub.id,
        },
      ];
    });
  }

  function isActivitySelected(subId: string) {
    return selectedItems.some((item) => item.subcategoryId === subId);
  }

  function startEdit(item: PlanItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditIcon(item.icon);
    setEditColor(item.color);
  }

  function saveEdit() {
    if (!editingId || !editTitle.trim()) return;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === editingId
          ? { ...item, title: editTitle.trim(), icon: editIcon, color: editColor }
          : item,
      ),
    );
    setEditingId(null);
  }

  function handleDeleteAll(cat: PlanningCategory) {
    setSelectedItems((prev) => prev.filter((item) => item.categoryId !== cat.id));
    setExpandedCatId((prev) => (prev === cat.id ? null : prev));
    setExpandedGroupId((prev) => (prev === cat.id ? null : prev));
  }

  function handleRemoveActivity(item: PlanItem) {
    setSelectedItems((prev) => prev.filter((selected) => selected.id !== item.id));
    if (editingId === item.id) setEditingId(null);
  }

  function handleActivityCreated(created: {
    id: string;
    name: string;
    icon: string;
    color: string;
    complexity: string;
    categoryId: string;
  }) {
    const cat = localCategories.find((c) => c.id === created.categoryId);
    if (!cat) return;

    const newSub: PlanningSubcategory = {
      id: created.id,
      name: created.name,
      icon: created.icon,
      color: created.color,
    };

    setLocalCategories((prev) =>
      prev.map((c) =>
        c.id === created.categoryId
          ? { ...c, subcategories: [...c.subcategories, newSub] }
          : c,
      ),
    );

    // Ensure the category is selected and the activity is linked in the plan.
    setSelectedItems((prev) => {
      const hasCategory = prev.some((item) => item.categoryId === cat.id);
      const base = hasCategory
        ? prev
        : [
            ...prev,
            {
              id: `temp-${cat.id}`,
              title: cat.name,
              icon: cat.icon,
              color: cat.color,
              categoryId: cat.id,
              subcategoryId: null,
            },
          ];
      const alreadyLinked = base.some((item) => item.subcategoryId === created.id);
      if (alreadyLinked) return base;
      return [
        ...base,
        {
          id: `temp-${created.id}`,
          title: created.name,
          icon: created.icon,
          color: created.color,
          categoryId: cat.id,
          subcategoryId: created.id,
        },
      ];
    });

    setExpandedCatId(cat.id);
    setExpandedGroupId(cat.id);
    setCreatingForCategoryId(null);
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
        setSelectedItems((prev) => [
          ...prev,
          {
            id: `temp-${newCat.id}`,
            title: newCat.name,
            icon: newCat.icon,
            color: newCat.color,
            categoryId: newCat.id,
            subcategoryId: null,
          },
        ]);
        setNewCatName("");
        setNewCatComplexity("MEDIUM");
        setShowNewCategory(false);
        router.refresh();
      } else {
        setNewCatError(result.error ?? "Error al Crear Nueva categoría");
      }
    });
  }

  if (typeof document === "undefined") return null;

  return createPortal(
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
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-xl"
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

            {/* Header */}
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                ¡Hola {userName}! ¿Qué te gustaría hacer hoy?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Elige categorías y vincula las actividades que harás hoy
              </p>
            </div>

            {/* Categories list */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Tus categorías</p>
              <div className="flex flex-wrap gap-2">
                {localCategories.map((cat) => {
                  const selected = isSelected(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender ${
                        selected
                          ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                          : "border-border bg-surface-muted text-foreground hover:bg-surface-hover"
                      }`}
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

            {/* Vincular actividades (categorías seleccionadas) */}
            {localCategories.some((cat) => isSelected(cat.id)) && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Vincular actividades</p>
                <div className="flex flex-col gap-2">
                  {localCategories
                    .filter((cat) => isSelected(cat.id))
                    .map((cat) => {
                      const isExpanded = expandedCatId === cat.id;
                      return (
                        <div
                          key={cat.id}
                          className="overflow-hidden rounded-2xl border border-border bg-surface-muted"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                            aria-expanded={isExpanded}
                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                          >
                            <span
                              className="flex size-6 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${cat.color}33` }}
                            >
                              <DynamicIcon name={cat.icon} className="size-3.5" style={{ color: cat.color }} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                              {cat.name}
                            </span>
                            <motion.span
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="shrink-0 text-muted-foreground"
                            >
                              <ChevronDown className="size-4" />
                            </motion.span>
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-col gap-2 border-t border-border p-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    {cat.subcategories.length === 0 ? (
                                      <p className="text-xs text-muted-foreground">
                                        Esta categoría no tiene actividades todavía.
                                      </p>
                                    ) : (
                                      cat.subcategories.map((sub) => {
                                        const linked = isActivitySelected(sub.id);
                                        return (
                                          <div key={sub.id} className="relative">
                                            <button
                                              type="button"
                                              onClick={() => toggleActivity(cat, sub)}
                                              aria-pressed={linked}
                                              className={cn(
                                                "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                                                linked
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
                                            </button>
                                            {linked && (
                                              <button
                                                type="button"
                                                onClick={() => toggleActivity(cat, sub)}
                                                aria-label={`Quitar ${sub.name}`}
                                                title="Quitar actividad"
                                                className="absolute -top-1.5 -right-1.5 flex size-4 cursor-pointer items-center justify-center rounded-full bg-red-400 text-white shadow-sm transition-colors hover:bg-red-500 focus-visible:outline-none"
                                              >
                                                <X className="size-2.5" />
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setCreatingForCategoryId(cat.id)}
                                    className="flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent-aprender/40 hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                                  >
                                    <Plus className="size-3.5" />
                                    Crear actividad personalizada
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Add new category inline */}
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
                  <p className="text-sm font-medium text-foreground">Crear Nueva categoría</p>
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
                      {isCreatingCat ? "Creando..." : "Crear y agregar al plan"}
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

            {/* Selected items grouped by category */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Tu plan para hoy</p>
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted p-6 text-center">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent-aprender/10 text-accent-aprender">
                    <CalendarCheck2 className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    Aún no has elegido nada para hoy
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Selecciona categorías arriba y vincula las actividades que quieres realizar. Tu plan
                    aparecerá aquí con cada categoría y sus actividades listas para empezar.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {grouped.map(({ category, items }) => {
                    const visibleItems = items.filter((item) => item.subcategoryId !== null);

                    return (
                      <div
                        key={category.id}
                        className="overflow-hidden rounded-2xl border border-border bg-surface-muted"
                      >
                        {/* Category header: toggle + delete */}
                        <div className="flex items-center gap-1 border-b border-border bg-surface">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedGroupId(
                                expandedGroupId === category.id ? null : category.id,
                              )
                            }
                            aria-expanded={expandedGroupId === category.id}
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-left transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                          >
                            <span
                              className="flex size-6 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${category.color}33` }}
                            >
                              <DynamicIcon name={category.icon} className="size-3.5" style={{ color: category.color }} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                              {category.name}
                            </span>
                            {visibleItems.length > 0 && (
                              <span className="shrink-0 rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {visibleItems.length}
                              </span>
                            )}
                            <motion.span
                              animate={{ rotate: expandedGroupId === category.id ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="shrink-0 text-muted-foreground"
                            >
                              <ChevronDown className="size-4" />
                            </motion.span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAll(category)}
                            aria-label={`Eliminar todo de ${category.name}`}
                            title="Eliminar todo"
                            className="mr-2 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:border-red-900 dark:hover:bg-red-950"
                          >
                            <Trash2 className="size-3.5" />
                            Eliminar todo
                          </button>
                        </div>

                        {/* Body: activities + vincular (solo visible si expandido) */}
                        <AnimatePresence initial={false}>
                          {expandedGroupId === category.id && (
                            <motion.div
                              key="body"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col">
                                {visibleItems.length === 0 ? (
                                  <p className="px-3 py-2 text-xs text-muted-foreground">
                                    Sin actividades vinculadas todavía.
                                  </p>
                                ) : (
                                  visibleItems.map((item) => {
                                    const isEditing = editingId === item.id;
                                    return (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-2 border-b border-border px-3 py-2 transition-colors duration-200 last:border-b-0"
                                      >
                                        {isEditing ? (
                                          <>
                                            <Input
                                              value={editTitle}
                                              onChange={(event) => setEditTitle(event.target.value)}
                                              maxLength={40}
                                              className="h-8 text-sm"
                                            />
                                            <Button size="md" onClick={saveEdit} disabled={!editTitle.trim()}>
                                              <Check className="size-3.5" />
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <span
                                              className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                                              style={{ backgroundColor: `${item.color}33` }}
                                            >
                                              <DynamicIcon name={item.icon} className="size-3.5" style={{ color: item.color }} />
                                            </span>
                                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                              {item.title}
                                              <span className="ml-1 text-[10px] text-muted-foreground">
                                                · Actividad
                                              </span>
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => startEdit(item)}
                                              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                                              aria-label="Editar"
                                            >
                                              <Pencil className="size-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveActivity(item)}
                                              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950"
                                              aria-label="Quitar actividad"
                                              title="Quitar actividad"
                                            >
                                              <Trash2 className="size-3.5" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })
                                )}

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col gap-4">
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
          </motion.div>
        </motion.div>
      )}

      <ActivityModal
        open={creatingForCategoryId !== null}
        categoryId={creatingForCategoryId ?? undefined}
        categoryName={localCategories.find((c) => c.id === creatingForCategoryId)?.name}
        onClose={() => setCreatingForCategoryId(null)}
        onSaved={() => router.refresh()}
        onCreated={handleActivityCreated}
      />
    </AnimatePresence>,
    document.body,
  );
}
