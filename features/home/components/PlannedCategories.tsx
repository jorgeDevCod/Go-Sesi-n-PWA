"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck2,
  Check,
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
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type PlannedItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
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
        hover: "Continuemos. ¡Tú puedes!",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      };
    }
    return {
      label: "En curso",
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
  const [planCollapsed, setPlanCollapsed] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

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

  const visibleItems = useMemo(
    () => items.filter((item) => item.subcategoryId !== null),
    [items],
  );
  const practicedCount = visibleItems.filter((item) => item.practiced).length;

  function handleNavigate(item: PlannedItem) {
    if (!item.categoryId || !item.subcategoryId) return;
    router.push(ROUTES.sessionNew(item.categoryId, item.subcategoryId));
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
      !window.confirm(`¿Quitar "${item.title}" del plan de hoy?`)
    ) {
      return;
    }
    void deleteItem(item.id);
  }

  async function handleDeleteAll() {
    if (visibleItems.length === 0) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `¿Quitar las ${visibleItems.length} actividades de tu planificación?`,
      )
    ) {
      return;
    }
    const ids = visibleItems.map((item) => item.id);
    const results = await Promise.all(ids.map((id) => deletePlanItemAction(id)));
    if (results.every((result) => result.success)) {
      onItemsChange(items.filter((item) => !ids.includes(item.id)));
      router.refresh();
    }
  }

  if (visibleItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted p-5 text-center">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent-aprender/10 text-accent-aprender">
          <CalendarCheck2 className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">Hoy aún no planificaste</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Elige una categoría y marca las actividades que quieras hacer.
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

  return (
    <div ref={planRef} className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <button
          type="button"
          onClick={() => setPlanCollapsed((value) => !value)}
          aria-expanded={!planCollapsed}
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
        >
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="font-display truncate text-base font-semibold text-foreground">
              Esta es tu Planificación
            </h2>
            <span className="shrink-0 text-xs text-muted-foreground">
              {practicedCount} de {visibleItems.length} realizadas
            </span>
          </div>
          <motion.span
            animate={{ rotate: planCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-muted-foreground"
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>
        <button
          type="button"
          onClick={() => void handleDeleteAll()}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:border-red-900 dark:hover:bg-red-950"
        >
          <Trash2 className="size-3.5" />
          Quitar todo
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!planCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="flex flex-col gap-2 p-3">
              {visibleItems.map((item) => {
                const isEditing = editingId === item.id;
                const status = statusForItem(item, activeSession);
                return (
                  <li
                    key={item.id}
                    className="group relative flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-2.5"
                  >
                    {isEditing ? (
                      <div className="flex flex-1 items-center gap-2">
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
                        <button
                          type="button"
                          onClick={() => handleNavigate(item)}
                          title={`Empezar ${item.title}`}
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                        >
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${item.color}33` }}
                          >
                            <DynamicIcon
                              name={item.icon}
                              className="size-4"
                              style={{ color: item.color }}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block truncate text-sm font-medium text-foreground",
                                item.practiced &&
                                  "text-muted-foreground line-through decoration-2",
                              )}
                            >
                              {item.title}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-1">
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${item.categoryColor}22`,
                                  color: item.categoryColor,
                                }}
                              >
                                <DynamicIcon name={item.categoryIcon} className="size-2.5" />
                                {item.categoryName}
                              </span>
                              {status && (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                    status.className,
                                  )}
                                  title={status.hover}
                                >
                                  {status.label === "En espera" ? (
                                    <Pause className="size-2.5" />
                                  ) : status.label === "En curso" ? (
                                    <Clock className="size-2.5" />
                                  ) : null}
                                  {status.label}
                                </span>
                              )}
                            </span>
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
                          aria-label={`Quitar ${item.title}`}
                          title="Quitar actividad"
                          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950"
                        >
                          <X className="size-3.5" />
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
