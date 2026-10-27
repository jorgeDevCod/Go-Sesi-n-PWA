import type { Metadata } from "next";
import { auth } from "@/auth";
import { listCategoriesWithSubcategoryCount } from "@/repositories/category.repository";
import { findUserById } from "@/repositories/user.repository";
import { getFocusStatsForUser, getLastSubcategoryName } from "@/repositories/focus-session.repository";
import { ensureDefaultCategoriesForUser } from "@/services/categories/ensure-default-categories.service";
import { CategoryHomeGrid } from "@/features/home/components/CategoryHomeGrid";
import { WelcomeBackCard } from "@/features/home/components/WelcomeBackCard";

export const metadata: Metadata = {
  title: "Inicio",
};

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function HomePage() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await findUserById(userId);
  const firstName = user?.name?.split(" ")[0] ?? "";

  await ensureDefaultCategoriesForUser(userId);

  const [categories, stats, lastActivity] = await Promise.all([
    listCategoriesWithSubcategoryCount(userId),
    getFocusStatsForUser(userId),
    getLastSubcategoryName(userId),
  ]);

  const mapped = categories.map((cat) => ({
    id: cat.id,
    key: cat.key,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    isDefault: cat.isDefault,
    complexity: cat.complexity,
    subcategoryCount: cat._count.subcategories,
  }));

  const isReturning = user
    ? user.createdAt < startOfToday() || stats.completedSessions > 0
    : false;

  return (
    <div className="flex flex-1 flex-col items-center gap-5">
      {isReturning && (
        <WelcomeBackCard
          firstName={firstName}
          completedSessions={stats.completedSessions}
          totalMinutes={stats.totalMinutes}
          lastActivity={lastActivity}
        />
      )}
      <CategoryHomeGrid initialCategories={mapped} />
    </div>
  );
}
