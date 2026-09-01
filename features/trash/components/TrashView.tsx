"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import {
  trashEmptyAction,
  trashRestoreAction,
  trashPermanentDeleteAction,
} from "@/features/categories/actions/trash.actions";
import { TRASH_MAX_ITEMS, TRASH_RETENTION_DAYS, type TrashItem } from "@/services/categories/trash.types";

export function TrashView({ initialItems }: { initialItems: TrashItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [prevItems, setPrevItems] = useState(initialItems);
  // Sincroniza el estado local cuando el server recarga la lista (router.refresh).
  if (initialItems !== prevItems) {
    setPrevItems(initialItems);
    setItems(initialItems);
  }
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<string | null>(null);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function cancelSelect() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  async function handleRestoreAll() {
    const result = await trashRestoreAction({ items: items.map((i) => ({ kind: i.kind, id: i.id })) });
    if (result.success) {
      setNote("Elementos restaurados.");
      router.refresh();
    }
  }

  async function handleRestoreSelected() {
    const result = await trashRestoreAction({
      items: selectedItems.map((i) => ({ kind: i.kind, id: i.id })),
    });
    if (result.success) {
      setNote(`${selectedItems.length} elemento(s) restaurado(s).`);
      cancelSelect();
      router.refresh();
    }
  }

  async function handleEmpty() {
    if (typeof window !== "undefined" && !window.confirm("¿Vaciar toda la papelera? Esta acción no se puede deshacer.")) {
      return;
    }
    const result = await trashEmptyAction();
    if (result.success) {
      setNote("Papelera vaciada.");
      cancelSelect();
      router.refresh();
    }
  }

  async function handlePermanentDelete() {
    const result = await trashPermanentDeleteAction({
      items: selectedItems.map((i) => ({ kind: i.kind, id: i.id })),
    });
    if (result.success) {
      const failed = result.failed.length;
      setNote(failed > 0 ? `Se eliminaron permanentemente ${selectedItems.length - failed}; ${failed} no se pudieron (tienen sesiones).` : `Se eliminaron permanentemente ${selectedItems.length}.`);
      cancelSelect();
      router.refresh();
    }
  }

  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Info de retención / límite */}
      <div className="rounded-2xl border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
        <p>
          La papelera guarda como máximo <span className="font-semibold text-foreground">{TRASH_MAX_ITEMS} artículos</span>.
          Los más antiguos se purgan automáticamente al superar el límite, y todo se elimina de forma permanente
          pasados <span className="font-semibold text-foreground">{TRASH_RETENTION_DAYS} días</span>.
        </p>
      </div>

      {note && (
        <p className="rounded-xl bg-accent-aprender/10 px-4 py-2 text-sm text-accent-aprender" role="status">
          {note}
        </p>
      )}

      {isEmpty ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-muted-foreground">
            <Trash2 className="size-6" />
          </span>
          <p className="text-sm font-medium text-foreground">La papelera está vacía</p>
          <p className="text-xs text-muted-foreground">
            Cuando elimines actividades o categorías, aparecerán aquí para que puedas restaurarlas.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {selectMode ? (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleRestoreSelected}
                  disabled={selectedIds.size === 0}
                  className="gap-2"
                >
                  <RotateCcw className="size-4" />
                  Restaurar seleccionadas ({selectedIds.size})
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handlePermanentDelete}
                  disabled={selectedIds.size === 0}
                  className="gap-2"
                >
                  <AlertTriangle className="size-4" />
                  Eliminar permanentemente
                </Button>
                <Button variant="ghost" size="md" onClick={cancelSelect} className="gap-2">
                  <X className="size-4" />
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="md" onClick={() => setSelectMode(true)} className="gap-2">
                  <Check className="size-4" />
                  Seleccionar y restaurar
                </Button>
                <Button variant="secondary" size="md" onClick={handleRestoreAll} className="gap-2">
                  <RotateCcw className="size-4" />
                  Restaurar todas
                </Button>
                <Button variant="danger" size="md" onClick={handleEmpty} className="gap-2">
                  <Trash2 className="size-4" />
                  Vaciar papelera
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const selected = selectedIds.has(item.id);
              return (
                <div
                  key={`${item.kind}-${item.id}`}
                  onClick={selectMode ? () => toggleSelect(item.id) : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-surface p-3 transition-all duration-200",
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
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${item.color}33`, color: item.color }}
                  >
                    <DynamicIcon name={item.icon} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.kind === "category" ? "Categoría" : `Actividad · ${item.categoryName}`}
                      {" · "}
                      {new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(item.deletedAt))}
                    </p>
                  </div>
                  {!selectMode && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        item.kind === "category"
                          ? "bg-surface-muted text-muted-foreground"
                          : "bg-accent-aprender/10 text-accent-aprender",
                      )}
                    >
                      {item.kind === "category" ? "Categoría" : "Actividad"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
