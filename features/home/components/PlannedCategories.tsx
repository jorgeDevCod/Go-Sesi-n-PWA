"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  updatePlanItemAction,
  deletePlanItemAction,
} from "@/features/planning/actions/planning.actions";
import { usePlanningStore } from "@/features/planning/store/planning.store";
import { cn } from "@/lib/utils";

export type PlannedItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
  completed: boolean;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  subcategoryId: string | null;
  practiced: boolean;
};

export type ActiveSessionInfo = {
  id: string;
  categoryId: string;
  subcategoryId: string;
  isPaused: boolean;
} | null;

type ItemStatus = {
  label: string;
  className: string;
  hover?: string;
  href?: string;
};

function statusForItem(item: PlannedItem, activeSession: ActiveSessionInfo): ItemStatus | null {
  if (item.practiced) {
    return {
      label: "Realizada",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    };
  }
  if (activeSession && activeSession.subcategoryId === item.subcategoryId) {
    if (activeSession.isPaused) {
      return {
        label: "En espera",
        hover: "Continuemos. ¡Tú puedes!!",
        href: "/app/session",
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      };
    }
    return {
      label: "En curso",
      href: "/app/session",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    };
  }
  return null;
}

export function PlannedCategories({
  items,
  activeSession,
  onItemsChange,
}: {
  items: PlannedItem[];
  activeSession: ActiveSessionInfo;
  onItemsChange: (items: PlannedItem[]) => void;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [closedKeys, setClosedKeys] = useState<Set<string>>(new Set());
  const [planCollapsed, setPlanCollapsed] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

  // Scroll hacia el plan al guardar la planificación. Reintenta hasta que el
  // componente esté montado (los items se actualizan tras router.refresh()).
  useEffect(() => {
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function scrollToPlan() {
      if (planRef.current) {
        planRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (attempts < 20) {
        attempts += 1;
        timer = setTimeout(scrollToPlan, 250);
      }
    }
    function onScrollToPlan() {
      attempts = 0;
      timer = setTimeout(scrollToPlan, 300);
    }
    window.addEventListener("gosession-scroll-to-plan", onScrollToPlan);
    return () => {
      window.removeEventListener("gosession-scroll-to-plan", onScrollToPlan);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Los items de categoría (subcategoryId null) no se muestran como fila:
  // la categoría ya aparece como título del grupo.
  const visibleItems = useMemo(
    () => items.filter((item) => item.subcategoryId !== null),
    [items],
  );

  const groups = useMemo(() => {
    const map = new Map<string, PlannedItem[]>();
    for (const item of visibleItems) {
    const key = item.categoryId ?? item.id ?? `item-${item.title}-${item.color}`;
    const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()]
      .map(([key, list]) => ({
        key,
        categoryName: list[0].categoryName || list[0].title,
        categoryIcon: list[0].categoryIcon || list[0].icon,
        categoryColor: list[0].categoryColor || list[0].color,
        items: list,
      }))
      .filter((group) => group.items.length > 0);
  }, [visibleItems]);

  const practicedCount = visibleItems.filter((item) => item.practiced).length;

  function toggleGroup(key: string) {
    setClosedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleNavigate(item: PlannedItem) {
    if (item.categoryId) {
      const url = item.subcategoryId
        ? `/app/session/new?category=${item.categoryId}&activity=${item.subcategoryId}`
        : `/app/session/new?category=${item.categoryId}`;
      router.push(url);
    }
  }

  function startEdit(item: PlannedItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
  }

  async function saveEdit() {
    if (!editingId || !editTitle.trim()) return;
    const result = await updatePlanItemAction(editingId, { title: editTitle.trim() });
    if (result.success) {
      onItemsChange(
        items.map((item) =>
          item.id === editingId ? { ...item, title: editTitle.trim() } : item,
        ),
      );
      setEditingId(null);
      router.refresh();
    }
  }

  async function deleteItem(id: string) {
    const result = await deletePlanItemAction(id);
    if (result.success) {
      onItemsChange(items.filter((item) => item.id !== id));
      router.refresh();
    }
  }

  function handleDeleteItem(item: PlannedItem) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`¿Eliminar "${item.title}" del plan de hoy?`)
    ) {
      return;
    }
    void deleteItem(item.id);
  }

  async function deleteAllForGroup(groupKey: string) {
    const group = groups.find((g) => g.key === groupKey);
    if (!group) return;
    const ids = group.items.map((item) => item.id);
    const results = await Promise.all(ids.map((id) => deletePlanItemAction(id)));
    if (results.every((result) => result.success)) {
      onItemsChange(items.filter((item) => !ids.includes(item.id)));
      router.refresh();
    }
  }

  function handleDeleteAll(groupKey: string, groupItems: PlannedItem[]) {
    if (groupItems.length === 0) return;
    const label = groupItems.length === 1 ? "actividad" : "actividades";
    if (
      typeof window !== "undefined" &&
      !window.confirm(`¿Eliminar todas las ${label} de esta categoría?`)
    ) {
      return;
    }
    void deleteAllForGroup(groupKey);
  }

  const col1 = groups.filter((_, i) => i % 2 === 0);
  const col2 = groups.filter((_, i) => i % 2 === 1);

  if (visibleItems.length === 0) return null;

  function renderEmpty() {
    if (items.length === 0) {
      // No hay items en absoluto — estado vacío inspirador
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted p-5 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-aprender/10 text-accent-aprender">
            <CalendarCheck2 className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Hoy aún no planificaste</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Elige categorías y sus actividades para armar tu plan del día.
            </p>
          </div>
          <Button
            size="md"
            onClick={() => usePlanningStore.getState().open()}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Agregar actividades
          </Button>
        </div>
      );
    }
    return null;
  }

  if (visibleItems.length === 0) return renderEmpty();

  return (
    <div ref={planRef} className="rounded-2xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setPlanCollapsed((v) => !v)}
        aria-expanded={!planCollapsed}
        className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base font-semibold text-foreground">Plan de hoy</h2>
          <span className="text-xs text-muted-foreground">
            {practicedCount} de {visibleItems.length} realizadas
          </span>
        </div>
        <motion.span animate={{ rotate: planCollapsed ? 0 : 180 }} transition={{ duration: 0.2 }} className="text-muted-foreground">
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {!planCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-3">
          {col1.map((group) => {
          const closed = closedKeys.has(group.key);
          const groupPracticed = group.items.some((item) => item.practiced);
          const isActiveInfo =
            activeSession && activeSession.categoryId === group.items[0].categoryId
              ? activeSession
              : null;
          const isActive = isActiveInfo !== null;

          return (
            <div
              key={group.key}
              className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
            >
              {/* Título de la categoría */}
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={!closed}
                className="flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${group.categoryColor}33`, color: group.categoryColor }}
                >
                  <DynamicIcon name={group.categoryIcon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">
                    {group.categoryName}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {group.items.length} {group.items.length === 1 ? "actividad" : "actividades"}
                  </span>
                </span>
                {groupPracticed && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Realizada
                  </span>
                )}
                {!groupPracticed && isActive && (
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isActiveInfo?.isPaused
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
                    )}
                    title={
                      isActiveInfo?.isPaused ? "Continuemos. ¡Tú puedes!!" : undefined
                    }
                  >
                    {isActiveInfo?.isPaused ? (
                      <Pause className="size-3" />
                    ) : (
                      <Clock className="size-3" />
                    )}
                    {isActiveInfo?.isPaused ? "En espera" : "En curso"}
                  </span>
                )}
                <motion.span
                  animate={{ rotate: closed ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-muted-foreground"
                >
                  <ChevronDown className="size-4" />
                </motion.span>
              </button>

              {/* Eliminar todo (debajo del título) */}
              <div className="border-t border-border px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => handleDeleteAll(group.key, group.items)}
                  aria-label="Eliminar todas las actividades de esta categoría"
                  title="Eliminar todo"
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:border-red-900 dark:hover:bg-red-950"
                >
                  <Trash2 className="size-3.5" />
                  Eliminar todo
                </button>
              </div>

              <AnimatePresence initial={false}>
                {!closed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2 border-t border-border p-3">
                      {group.items.map((item) => {
                        const isEditing = editingId === item.id;
                        const status = statusForItem(item, activeSession);
                        return (
                          <div
                            key={item.id}
                            className="group relative flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-2.5 transition-all duration-200"
                          >
                            {isEditing ? (
                              <div className="flex flex-1 items-center gap-2">
                                <Input
                                  value={editTitle}
                                  onChange={(event) => setEditTitle(event.target.value)}
                                  maxLength={40}
                                  className="h-8 text-sm"
                                />
                                <Button size="md" onClick={saveEdit} disabled={!editTitle.trim()}>
                                  <Check className="size-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleNavigate(item)}
                                  title={
                                    status?.href
                                      ? status.label === "En espera"
                                        ? "Continuemos. ¡Tú puedes!!"
                                        : "Seguir sesión"
                                      : `Empezar actividad de ${item.title}`
                                  }
                                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                                >
                                  <span
                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${item.color}33` }}
                                  >
                                    <DynamicIcon name={item.icon} className="size-4" style={{ color: item.color }} />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span
                                      className={cn(
                                        "block truncate text-sm font-medium text-foreground",
                                        item.practiced && "text-muted-foreground line-through decoration-2",
                                      )}
                                    >
                                      {item.title}
                                    </span>
                                    {status && (
                                      <span
                                        className={cn(
                                          "mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                          status.className,
                                        )}
                                        title={status.hover}
                                      >
                                        {status.label}
                                      </span>
                                    )}
                                  </span>
                                  <Play className="size-3.5 shrink-0 text-muted-foreground" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEdit(item)}
                                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                                  aria-label="Editar actividad"
                                  title="Editar actividad"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item)}
                                  aria-label={`Eliminar ${item.title}`}
                                  title="Eliminar actividad"
                                  className="absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-surface text-muted-foreground opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-500 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                >
                                  <X className="size-3" />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
          })}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {col2.map((group) => {
          const closed = closedKeys.has(group.key);
          const groupPracticed = group.items.some((item) => item.practiced);
          const isActiveInfo =
            activeSession && activeSession.categoryId === group.items[0].categoryId
              ? activeSession
              : null;
          const isActive = isActiveInfo !== null;

          return (
            <div
              key={group.key}
              className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
            >
              {/* Título de la categoría */}
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={!closed}
                className="flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${group.categoryColor}33`, color: group.categoryColor }}
                >
                  <DynamicIcon name={group.categoryIcon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">
                    {group.categoryName}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {group.items.length} {group.items.length === 1 ? "actividad" : "actividades"}
                  </span>
                </span>
                {groupPracticed && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Realizada
                  </span>
                )}
                {!groupPracticed && isActive && (
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isActiveInfo?.isPaused
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
                    )}
                    title={
                      isActiveInfo?.isPaused ? "Continuemos. ¡Tú puedes!!" : undefined
                    }
                  >
                    {isActiveInfo?.isPaused ? (
                      <Pause className="size-3" />
                    ) : (
                      <Clock className="size-3" />
                    )}
                    {isActiveInfo?.isPaused ? "En espera" : "En curso"}
                  </span>
                )}
                <motion.span
                  animate={{ rotate: closed ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-muted-foreground"
                >
                  <ChevronDown className="size-4" />
                </motion.span>
              </button>

              {/* Eliminar todo (debajo del título) */}
              <div className="border-t border-border px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => handleDeleteAll(group.key, group.items)}
                  aria-label="Eliminar todas las actividades de esta categoría"
                  title="Eliminar todo"
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:border-red-900 dark:hover:bg-red-950"
                >
                  <Trash2 className="size-3.5" />
                  Eliminar todo
                </button>
              </div>

              <AnimatePresence initial={false}>
                {!closed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2 border-t border-border p-3">
                      {group.items.map((item) => {
                        const isEditing = editingId === item.id;
                        const status = statusForItem(item, activeSession);
                        return (
                          <div
                            key={item.id}
                            className="group relative flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-2.5 transition-all duration-200"
                          >
                            {isEditing ? (
                              <div className="flex flex-1 items-center gap-2">
                                <Input
                                  value={editTitle}
                                  onChange={(event) => setEditTitle(event.target.value)}
                                  maxLength={40}
                                  className="h-8 text-sm"
                                />
                                <Button size="md" onClick={saveEdit} disabled={!editTitle.trim()}>
                                  <Check className="size-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleNavigate(item)}
                                  title={
                                    status?.href
                                      ? status.label === "En espera"
                                        ? "Continuemos. ¡Tú puedes!!"
                                        : "Seguir sesión"
                                      : `Empezar actividad de ${item.title}`
                                  }
                                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                                >
                                  <span
                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${item.color}33` }}
                                  >
                                    <DynamicIcon name={item.icon} className="size-4" style={{ color: item.color }} />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span
                                      className={cn(
                                        "block truncate text-sm font-medium text-foreground",
                                        item.practiced && "text-muted-foreground line-through decoration-2",
                                      )}
                                    >
                                      {item.title}
                                    </span>
                                    {status && (
                                      <span
                                        className={cn(
                                          "mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                          status.className,
                                        )}
                                        title={status.hover}
                                      >
                                        {status.label}
                                      </span>
                                    )}
                                  </span>
                                  <Play className="size-3.5 shrink-0 text-muted-foreground" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEdit(item)}
                                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                                  aria-label="Editar actividad"
                                  title="Editar actividad"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item)}
                                  aria-label={`Eliminar ${item.title}`}
                                  title="Eliminar actividad"
                                  className="absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-surface text-muted-foreground opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-500 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                >
                                  <X className="size-3" />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
          })}
        </div>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
