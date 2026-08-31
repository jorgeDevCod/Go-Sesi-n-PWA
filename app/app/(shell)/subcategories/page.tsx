import type { Metadata } from "next";
import { auth } from "@/auth";
import { listCategoriesForUser } from "@/repositories/category.repository";
import { listSubcategories } from "@/services/categories/list-subcategories.service";
import { CategoryTabs } from "@/features/categories/components/CategoryTabs";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";

export const metadata: Metadata = {
  title: "Actividades",
};

export default async function SubcategoriesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [categories, subcategories] = await Promise.all([
    listCategoriesForUser(userId),
    listSubcategories(userId),
  ]);

  const itemsByCategory: Record<string, SubcategoryItem[]> = {};
  for (const category of categories) {
    itemsByCategory[category.id] = [];
  }
  for (const sub of subcategories) {
    itemsByCategory[sub.categoryId] ??= [];
    itemsByCategory[sub.categoryId].push({
      id: sub.id,
      name: sub.name,
      icon: sub.icon,
      color: sub.color,
      order: sub.order,
      categoryId: sub.categoryId,
      complexity: sub.complexity,
      energyLevel: sub.energyLevel as SubcategoryItem["energyLevel"],
      energyComplexity: sub.energyComplexity as SubcategoryItem["energyComplexity"],
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-display mb-6 text-2xl font-semibold text-foreground">
        Tus Actividades
      </h1>
      <CategoryTabs categories={categories} itemsByCategory={itemsByCategory} />
    </div>
  );
}
