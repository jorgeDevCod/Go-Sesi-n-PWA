import type { Metadata } from "next";
import { permanentRedirect, redirect } from "next/navigation";
import { auth } from "@/auth";
import { findCategoryByKeyOrIdForUser } from "@/repositories/category.repository";
import { listSubcategories } from "@/services/categories/list-subcategories.service";
import { parseActivityPomodoroConfig } from "@/services/categories/activity-pomodoro.service";
import { SessionWizard } from "@/features/session/components/SessionWizard";
import { ROUTES } from "@/lib/routes";
import type { EnergyLevel } from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

export const metadata: Metadata = {
  title: "Nueva sesión",
};

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    activity?: string;
    categoria?: string;
    actividad?: string;
  }>;
}) {
  const {
    category: categoryKey,
    activity: startWith,
    categoria,
    actividad,
  } = await searchParams;
  const categoryParam = categoria ?? categoryKey;
  const activityParam = actividad ?? startWith;

  // Normaliza enlaces antiguos con ?category / ?activity.
  if (
    categoryParam &&
    activityParam &&
    ((categoryKey && !categoria) || (startWith && !actividad))
  ) {
    permanentRedirect(ROUTES.sessionNew(categoryParam, activityParam));
  }

  if (!categoryParam) {
    redirect(ROUTES.home);
  }

  const session = await auth();
  const userId = session!.user.id;

  const category = await findCategoryByKeyOrIdForUser(userId, categoryParam);
  if (!category) {
    redirect(ROUTES.home);
  }

  const subcategories = await listSubcategories(userId, category.id);

  if (!activityParam || !subcategories.some((sub) => sub.id === activityParam)) {
    redirect(ROUTES.activities(category.id));
  }

  return (
    <div className="mx-auto w-full max-w-2xl py-8">
      <SessionWizard
        categoryName={category.name}
        startWithId={activityParam}
        subcategories={subcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
          icon: sub.icon,
          color: sub.color,
          complexity: sub.complexity,
          energyLevel: (sub.energyLevel as EnergyLevel | null) ?? null,
          energyComplexity: (sub.energyComplexity as Complexity | null) ?? null,
          pomodoroConfig: parseActivityPomodoroConfig(sub.pomodoroConfig),
          lastClassicMinutes: sub.lastClassicMinutes,
          lastMode: sub.lastMode,
        }))}
      />
    </div>
  );
}
