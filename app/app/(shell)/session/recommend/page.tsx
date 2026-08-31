import type { Metadata } from "next";
import { auth } from "@/auth";
import { listCategoriesForUser } from "@/repositories/category.repository";
import { listSubcategories } from "@/services/categories/list-subcategories.service";
import { RecommendationScreen } from "@/features/session/components/RecommendationScreen";
import type { PickableSubcategory } from "@/features/session/components/SubcategoryPickerList";

export const metadata: Metadata = {
  title: "No sé qué hacer",
};

export default async function RecommendPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [categories, subcategories] = await Promise.all([
    listCategoriesForUser(userId),
    listSubcategories(userId),
  ]);

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  const allSubcategories: PickableSubcategory[] = subcategories.map((sub) => ({
    id: sub.id,
    name: sub.name,
    icon: sub.icon,
    color: sub.color,
    categoryId: sub.categoryId,
    categoryName: categoryNameById.get(sub.categoryId) ?? "",
    complexity: sub.complexity,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      <RecommendationScreen
        allSubcategories={allSubcategories}
        categories={categories.map((c) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          icon: c.icon,
          color: c.color,
          complexity: c.complexity,
        }))}
      />
    </div>
  );
}
