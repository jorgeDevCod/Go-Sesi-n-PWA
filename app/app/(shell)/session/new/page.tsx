import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { findCategoryByKeyOrIdForUser } from "@/repositories/category.repository";
import { listSubcategories } from "@/services/categories/list-subcategories.service";
import { SessionWizard } from "@/features/session/components/SessionWizard";
import type { EnergyLevel } from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

export const metadata: Metadata = {
  title: "Nueva sesión",
};

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; activity?: string }>;
}) {
  const { category: categoryKey, activity: startWith } = await searchParams;
  if (!categoryKey) {
    redirect("/app/home");
  }

  const session = await auth();
  const userId = session!.user.id;

  const category = await findCategoryByKeyOrIdForUser(userId, categoryKey);
  if (!category) {
    redirect("/app/home");
  }

  const subcategories = await listSubcategories(userId, category.id);

  return (
    <div className="mx-auto w-full max-w-2xl py-8">
      <SessionWizard
        categoryName={category.name}
        startWithId={startWith}
        subcategories={subcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
          icon: sub.icon,
          color: sub.color,
          complexity: sub.complexity,
          energyLevel: (sub.energyLevel as EnergyLevel | null) ?? null,
          energyComplexity: (sub.energyComplexity as Complexity | null) ?? null,
        }))}
      />
    </div>
  );
}
