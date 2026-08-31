"use client";

import { motion } from "framer-motion";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

export type PickableSubcategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  categoryId: string;
  categoryName: string;
  complexity: Complexity;
};

const COMPLEXITY_BADGE: Record<Complexity, string> = {
  LOW: "bg-surface-muted text-muted-foreground",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  HIGH: "bg-indigo-100 text-accent-aprender dark:bg-indigo-950 dark:text-indigo-400",
};

export function SubcategoryPickerList({
  items,
  onSelect,
}: {
  items: PickableSubcategory[];
  onSelect: (item: PickableSubcategory) => void;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <motion.button
            type="button"
            onClick={() => onSelect(item)}
            title={`${item.name}-Haz clic para empezar una sesión`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${item.color}33`, color: item.color }}
            >
              <DynamicIcon name={item.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{item.name}</p>
              <p className="truncate text-xs text-muted-foreground">{item.categoryName}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                COMPLEXITY_BADGE[item.complexity],
              )}
            >
              {COMPLEXITY_LABELS[item.complexity]}
            </span>
          </motion.button>
        </li>
      ))}
    </ul>
  );
}
