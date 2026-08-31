"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import {
  SubcategoryPickerList,
  type PickableSubcategory,
} from "@/features/session/components/SubcategoryPickerList";
import type { Complexity } from "@/lib/constants/default-subcategories";

export type AccordionCategory = {
  id: string;
  key: string | null;
  name: string;
  icon: string;
  color: string;
  complexity?: Complexity;
};

export function CategoryAccordionPicker({
  categories,
  items,
  onSelect,
  onCreateActivity,
}: {
  categories: AccordionCategory[];
  items: PickableSubcategory[];
  onSelect: (item: PickableSubcategory) => void;
  onCreateActivity: (category: AccordionCategory) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          subcategories: items.filter((item) => item.categoryId === category.id),
        }))
        .filter((group) => group.subcategories.length > 0),
    [categories, items],
  );

  if (groups.length === 0) return null;

  return (
    <ul className="flex flex-col gap-4">
      {groups.map(({ category, subcategories }) => {
        const isOpen = openId === category.id;
        return (
          <li
            key={category.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : category.id)}
                aria-expanded={isOpen}
                title={`${category.name}-${subcategories.length} actividades`}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 p-3 text-left transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${category.color}33`, color: category.color }}
                >
                  <DynamicIcon name={category.icon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">{category.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {subcategories.length}{" "}
                    {subcategories.length === 1 ? "actividad" : "actividades"}
                  </span>
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-muted-foreground"
                >
                  <ChevronDown className="size-4" />
                </motion.span>
              </button>
              <button
                type="button"
                onClick={() => onCreateActivity(category)}
                title={`Crear una actividad en ${category.name}`}
                aria-label={`Crear una actividad en ${category.name}`}
                className="mr-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border p-3">
                    <SubcategoryPickerList items={subcategories} onSelect={onSelect} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
