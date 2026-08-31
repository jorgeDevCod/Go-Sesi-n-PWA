import { prisma } from "@/lib/prisma";
import { findUserById } from "@/repositories/user.repository";
import { seedDefaultCategoriesForUser } from "./seed-default-categories";
import { CURRENT_SEED_VERSION } from "@/lib/constants/categories";

/**
 * Backfill for accounts whose seed banks are behind the current version.
 * The seed itself is idempotent: it only inserts missing categories and
 * activities, and re-applies the difficulty of default categories by key.
 * Runs once per seed version, guarded by `User.seedVersion`.
 */
export async function ensureDefaultCategoriesForUser(userId: string) {
  const user = await findUserById(userId);
  if (!user || user.seedVersion >= CURRENT_SEED_VERSION) return;

  await prisma.$transaction(async (tx) => {
    await seedDefaultCategoriesForUser(userId, tx);
    await tx.user.update({
      where: { id: userId },
      data: { seedVersion: CURRENT_SEED_VERSION },
    });
  });
}
