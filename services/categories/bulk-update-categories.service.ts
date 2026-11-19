import { bulkUpdateCategories } from "@/repositories/category.repository";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";

export function bulkUpdateCategoriesForUser(
  userId: string,
  ids: string[],
  values: {
    complexity: Complexity;
    energyLevel: EnergyLevel | null | undefined;
    energyComplexity: Complexity | null | undefined;
  },
) {
  return bulkUpdateCategories(userId, ids, {
    complexity: values.complexity,
    energyLevel: values.energyLevel ?? null,
    energyComplexity: values.energyComplexity ?? null,
  });
}
