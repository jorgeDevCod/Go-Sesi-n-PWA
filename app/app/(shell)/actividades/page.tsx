import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { auth } from "@/auth";
import { listCategoriesForUser } from "@/repositories/category.repository";
import { listSubcategories } from "@/services/categories/list-subcategories.service";
import { parseActivityPomodoroConfig } from "@/services/categories/activity-pomodoro.service";
import { ActivitiesTab } from "@/features/routine/components/ActivitiesTab";
import { ROUTES } from "@/lib/routes";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";

export const metadata: Metadata = {
  title: "Actividades",
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; category?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const { categoria, category } = await searchParams;
  if (!categoria && category) {
    permanentRedirect(ROUTES.activityView(category));
  }

  const [categories, subcategories] = await Promise.all([
    listCategoriesForUser(userId),
    listSubcategories(userId),
  ]);

  const itemsByCategory: Record<string, SubcategoryItem[]> = {};
  for (const cat of categories) {
    itemsByCategory[cat.id] = [];
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
      pomodoroConfig: parseActivityPomodoroConfig(sub.pomodoroConfig),
      lastClassicMinutes: sub.lastClassicMinutes,
      lastMode: sub.lastMode,
    });
  }

  const requestedCategoryId = categoria ?? category;
  const initialCategoryId =
    requestedCategoryId &&
    categories.some((cat) => cat.id === requestedCategoryId)
      ? requestedCategoryId
      : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="text-start">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Centro de Actividades</h1>
      </div>
      <ActivitiesTab
        categories={categories}
        itemsByCategory={itemsByCategory}
        initialCategoryId={initialCategoryId}
        activityBasePath="/app/actividades"
      />
    </div>
  );
}
