import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { auth } from "@/auth";
import { listCategoriesForUser } from "@/repositories/category.repository";
import { listSubcategories } from "@/services/categories/list-subcategories.service";
import { parseActivityPomodoroConfig } from "@/services/categories/activity-pomodoro.service";
import { RoutineTabs, TAB_BY_PARAM } from "@/features/routine/components/RoutineTabs";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Personaliza tu Experiencia",
};

export default async function RoutinePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; category?: string; categoria?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const { tab, category, categoria } = await searchParams;
  if (!categoria && category) {
    permanentRedirect(ROUTES.activities(category));
  }
  const initialTab = tab ? TAB_BY_PARAM[tab] : undefined;
  const requestedCategoryId = categoria;

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
      pomodoroConfig: parseActivityPomodoroConfig(sub.pomodoroConfig),
      lastClassicMinutes: sub.lastClassicMinutes,
      lastMode: sub.lastMode,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <RoutineTabs
        categories={categories}
        itemsByCategory={itemsByCategory}
        initialTab={initialTab}
        initialCategoryId={
          requestedCategoryId &&
          categories.some((category) => category.id === requestedCategoryId)
            ? requestedCategoryId
            : null
        }
      />
    </div>
  );
}
