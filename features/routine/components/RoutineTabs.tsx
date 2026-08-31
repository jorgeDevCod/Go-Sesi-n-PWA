"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, ListChecks, Wand2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";
import type { Complexity } from "@/lib/constants/default-subcategories";
import { CategoriesTab } from "@/features/routine/components/CategoriesTab";
import { ActivitiesTab } from "@/features/routine/components/ActivitiesTab";
import { RecommendationsTab } from "@/features/routine/components/RecommendationsTab";

export type RoutineCategory = {
  id: string;
  key: string | null;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  complexity: Complexity;
};

type TabKey = "categories" | "activities" | "recommendations";

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "categories", label: "Categorías", icon: Layers },
  { key: "activities", label: "Actividades", icon: ListChecks },
  { key: "recommendations", label: "Recomendaciones", icon: Wand2 },
];

export function RoutineTabs({
  categories,
  itemsByCategory,
}: {
  categories: RoutineCategory[];
  itemsByCategory: Record<string, SubcategoryItem[]>;
}) {
  const [active, setActive] = useState<TabKey>("categories");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Personaliza tu rutina
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Aquí armamos juntos cómo Go Sesión te recomendará actividades. Elige tus categorías,
          actividades, niveles de energía y tiempos ideales para que cada sugerencia se ajuste totalmente a ti.
        </p>
      </div>

      <div role="tablist" aria-label="Personalización" className="flex flex-wrap gap-4 justify-center py-2">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {active === "categories" && <CategoriesTab categories={categories} />}
          {active === "activities" && (
            <ActivitiesTab categories={categories} itemsByCategory={itemsByCategory} />
          )}
          {active === "recommendations" && <RecommendationsTab categories={categories} itemsByCategory={itemsByCategory} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
