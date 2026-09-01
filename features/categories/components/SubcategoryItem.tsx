"use client";

import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Pencil, Trash2, Play, House } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
import { useHomeQuickStore } from "@/features/home/store/home-quick.store";
import type { SubcategoryItem as SubcategoryItemType } from "@/features/categories/store/subcategory.store";

const COMPLEXITY_BADGE: Record<
  SubcategoryItemType["complexity"],
  string
> = {
  LOW: "bg-surface-muted text-muted-foreground",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  HIGH: "bg-indigo-100 text-accent-aprender dark:bg-indigo-950 dark:text-indigo-400",
};

export function SubcategoryItem({
  item,
  onEdit,
  onDelete,
  category,
  selectMode = false,
  selected = false,
  onToggleSelect,
}: {
  item: SubcategoryItemType;
  onEdit: () => void;
  onDelete: () => void;
  category?: { id: string; name: string; icon: string; color: string };
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const router = useRouter();
  const homeQuick = useHomeQuickStore();
  const added = homeQuick.items.some((i) => i.subcategoryId === item.id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleStart() {
    if (selectMode) {
      onToggleSelect?.(item.id);
      return;
    }
    router.push(`/app/session/new?category=${item.categoryId}&activity=${item.id}`);
  }

  function toggleHome() {
    if (added) {
      homeQuick.remove(item.id);
      return;
    }
    homeQuick.add({
      subcategoryId: item.id,
      subcategoryName: item.name,
      subcategoryIcon: item.icon,
      subcategoryColor: item.color,
      categoryId: item.categoryId,
      categoryName: category?.name ?? "",
      categoryIcon: category?.icon ?? "Folder",
      categoryColor: category?.color ?? "#6366F1",
      complexity: item.complexity,
    });
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={selectMode ? () => onToggleSelect?.(item.id) : undefined}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border bg-surface p-3 transition-all duration-200",
        selectMode ? "cursor-pointer" : "border-border shadow-sm",
        selectMode && selected && "border-red-400 bg-red-50 ring-2 ring-red-300 dark:bg-red-950/40 dark:ring-red-700",
        selectMode && !selected && "border-dashed border-border",
        isDragging && "shadow-lg",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reordenar ${item.name}`}
          title="Arrastra para reordenar"
          className="flex size-8 shrink-0 cursor-grab items-center justify-center text-muted-foreground touch-none active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${item.color}33`, color: item.color }}
        >
          <DynamicIcon name={item.icon} className="size-5" />
        </span>

        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {item.name}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pl-10">
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            COMPLEXITY_BADGE[item.complexity],
          )}
        >
          {COMPLEXITY_LABELS[item.complexity]}
        </span>

        <div className="flex items-center gap-1">
          {selectMode ? (
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border transition-colors",
                selected
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-border bg-surface text-transparent",
              )}
            >
              <Check className="size-4" />
            </span>
          ) : (
            <>
          <button
            type="button"
            onClick={toggleHome}
            aria-label={`${added ? "Quitar del inicio" : "Agregar al inicio"} ${item.name}`}
            title={added ? "Quitar del inicio" : "Agregar al inicio"}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-aprender/10 hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <House className={cn("size-4", added && "fill-accent-aprender text-accent-aprender")} />
          </button>
          <button
            type="button"
            onClick={handleStart}
            aria-label={`Iniciar ${item.name}`}
            title={`Iniciar ${item.name}`}
            className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-accent-aprender transition-colors hover:bg-accent-aprender/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <Play className="size-3.5" />
            Iniciar
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${item.name}`}
            title={`Editar ${item.name}`}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar ${item.name}`}
            title={`Eliminar ${item.name}`}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="size-4" />
          </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
