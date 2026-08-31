import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { CATEGORY_SEED } from "@/lib/constants/categories";
import { DEFAULT_SUBCATEGORIES_BY_KEY } from "@/lib/constants/default-subcategories";

/**
 * Creates the default categories and their activity bank for a user.
 *
 * Idempotent: existing categories (by key) and existing subcategories (by
 * name) are left untouched. Works both inside the registration transaction
 * and as a one-time backfill for accounts created before these seeds existed.
 */
export async function seedDefaultCategoriesForUser(
  userId: string,
  tx: Prisma.TransactionClient = prisma,
) {
  const existing = await tx.category.findMany({
    where: { userId },
    select: { key: true, name: true, id: true },
  });

  const byKey = new Map<string, (typeof existing)[number]>();
  const byName = new Set(existing.map((c) => c.name));
  for (const category of existing) {
    if (category.key) byKey.set(category.key, category);
  }

  for (const seed of CATEGORY_SEED) {
    if (byKey.has(seed.key)) continue;

    if (byName.has(seed.name)) {
      // A category with the same name already exists. If it has no seed key
      // (e.g. created manually before the banks existed), align it with the
      // seed so its activity bank, energy compatibility and difficulty apply.
      const match = existing.find((c) => c.name === seed.name && !c.key);
      if (match) {
        await tx.category.update({
          where: { id: match.id },
          data: { key: seed.key, complexity: seed.complexity },
        });
        byKey.set(seed.key, match);
      }
      continue;
    }

    const category = await tx.category.create({
      data: {
        key: seed.key,
        name: seed.name,
        icon: seed.icon,
        color: seed.color,
        order: seed.order,
        isDefault: true,
        complexity: seed.complexity,
        userId,
      },
    });
    byKey.set(seed.key, category);
    byName.add(category.name);
  }

  for (const seed of CATEGORY_SEED) {
    const category = byKey.get(seed.key);
    if (!category) continue;
    await tx.category.update({
      where: { id: category.id },
      data: { complexity: seed.complexity },
    });
  }

  for (const [key, category] of byKey) {
    const bank = DEFAULT_SUBCATEGORIES_BY_KEY[key];
    if (!bank) continue;

    const existingSubs = await tx.subcategory.findMany({
      where: { userId, categoryId: category.id },
      select: { name: true },
    });
    const existingNames = new Set(existingSubs.map((s) => s.name));
    const missing = bank.filter((seed) => !existingNames.has(seed.name));
    if (missing.length === 0) continue;

    const baseOrder = existingSubs.length;
    await tx.subcategory.createMany({
      data: missing.map((seed, index) => ({
        name: seed.name,
        icon: seed.icon,
        color: seed.color,
        order: baseOrder + index,
        complexity: seed.complexity,
        categoryId: category.id,
        userId,
      })),
    });
  }
}
