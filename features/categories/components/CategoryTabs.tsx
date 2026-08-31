"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import { SubcategoryList } from "@/features/categories/components/SubcategoryList";
import { CreateCategoryCard } from "@/features/categories/components/CreateCategoryCard";
import { CategoryModal } from "@/features/categories/components/CategoryModal";
import { updateCategoryAction } from "@/features/categories/actions/category.actions";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";
import type { Complexity } from "@/lib/constants/default-subcategories";

type CategoryOption = {
  id: string;
  key: string | null;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  complexity: Complexity;
};

export function CategoryTabs({
  categories,
  itemsByCategory,
}: {
  categories: CategoryOption[];
  itemsByCategory: Record<string, SubcategoryItem[]>;
}) {
  const router = useRouter();
  const [categoryList, setCategoryList] = useState(categories);
  const [selected, setSelected] = useState(categories[0]?.id ?? "");
  const [editCategory, setEditCategory] = useState<CategoryOption | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex flex-wrap gap-2">
        {categoryList.map((category) => {
          const isSelected = selected === category.id;
          return (
            <div
              key={category.id}
              className={cn(
                "flex items-center rounded-full border py-1 pl-4 pr-1.5 transition-colors duration-200",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface hover:bg-surface-muted",
              )}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelected(category.id)}
                title={category.name}
                className="flex cursor-pointer items-center gap-2 text-sm font-medium focus-visible:outline-none"
              >
                <DynamicIcon name={category.icon} className="size-4" />
                {category.name}
              </button>
              <button
                type="button"
                onClick={() => setEditCategory(category)}
                aria-label={`Editar categoría ${category.name}`}
                title={`Editar ${category.name}`}
                className={cn(
                  "ml-1 flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                  isSelected
                    ? "text-background/70 hover:bg-background/10 hover:text-background"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                )}
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          );
        })}

        <CreateCategoryCard
          onCreated={(category) =>
            setCategoryList((prev) => [...prev, { ...category, isDefault: false }])
          }
        />      </div>

      {categoryList.map((category) =>
        category.id === selected ? (
          <SubcategoryList
            key={category.id}
            categoryId={category.id}
            categoryName={category.name}
            categoryIcon={category.icon}
            categoryColor={category.color}
            categoryComplexity={category.complexity}
            initialItems={itemsByCategory[category.id] ?? []}
            showEnergyInModal={false}
          />
        ) : null,
      )}

      <CategoryModal
        open={editCategory !== null}
        initial={editCategory}
        onSubmit={(values) => {
          if (!editCategory) {
            return Promise.resolve({ success: false, error: "No hay categoría activa." });
          }
          return updateCategoryAction({ id: editCategory.id, ...values }).then((result) => {
            if (result.success) {
              setCategoryList((prev) =>
                prev.map((c) => (c.id === editCategory.id ? { ...c, ...values } : c)),
              );
              router.refresh();
            }
            return result;
          });
        }}
        onSaved={() => router.refresh()}
        onClose={() => setEditCategory(null)}
      />
    </div>
  );
}
