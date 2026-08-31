import { listSubcategoriesByUser } from "@/repositories/subcategory.repository";
import { getLastPracticedAtBySubcategory } from "@/repositories/focus-session.repository";
import { listCategoriesForUser } from "@/repositories/category.repository";
import { daysSince, formatRecommendationReason } from "./format-reason";
import {
  isEnergyCompatible,
  ENERGY_RECOMMENDED_DURATION,
  preferredComplexity,
  complexityFit,
  effectiveComplexityTargets,
  effectiveEnergyMax,
  suggestedMinutesFor,
  type EnergyLevel,
  type EnergyOverrides,
} from "./energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { Recommendation, RecommendationService } from "./recommendation.types";

/** Ventana de normalización de "días sin practicar". */
const RECENCY_WINDOW_DAYS = 14;
const RECENCY_WEIGHT = 0.5;
const COMPLEXITY_WEIGHT = 0.5;

type Subcategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  complexity: Complexity;
  categoryId: string;
  energyLevel: string | null;
  energyComplexity: Complexity | null;
};

type Category = {
  id: string;
  key: string | null;
  name: string;
  complexity: Complexity | null;
  energyLevel: string | null;
  energyComplexity: Complexity | null;
};

export const ruleBasedRecommendationService: RecommendationService = {
  async getRecommendation(userId, energy, preferredMinutes, overrides) {
    const list = await this.getRecommendations(userId, energy, preferredMinutes, 1, overrides);
    return list[0] ?? null;
  },

  /**
   * Ranking de recomendaciones por energía: filtra actividades según la
   * complejidad adecuada al nivel de energía y las ordena por ajuste
   * (complejidad preferida + días sin practicar). La primera es la "más
   * promedio" para ese nivel de energía. `overrides` permite aplicar la
   * personalización del usuario (tiempos y dificultades).
   */
  async getRecommendations(
    userId: string,
    energy?: EnergyLevel,
    preferredMinutes?: number,
    limit = 6,
    overrides?: EnergyOverrides,
  ): Promise<Recommendation[]> {
    const [subcategories, categories, lastPracticedBySubcategory] = await Promise.all([
      listSubcategoriesByUser(userId),
      listCategoriesForUser(userId),
      getLastPracticedAtBySubcategory(userId),
    ]);

    if (subcategories.length === 0) return [];

    const categoryById = new Map<string, Category>(categories.map((category) => [category.id, category]));
    const categoryKeyById = new Map<string, string | null>(
      categories.map((category) => [category.id, category.key]),
    );

    let candidates: Subcategory[] = subcategories;

    if (energy) {
      // Filtrar por categorías y subcategorías para esta energía
      const categoryIds = overrides?.energyCategoryIds?.[energy];
      const subcategoryIds = overrides?.energySubcategoryIds?.[energy];
      if (categoryIds && categoryIds.length > 0) {
        candidates = candidates.filter((sub) => categoryIds.includes(sub.categoryId));
      }
      if (subcategoryIds && subcategoryIds.length > 0) {
        candidates = candidates.filter((sub) => subcategoryIds.includes(sub.id));
      }
      if (candidates.length === 0) candidates = subcategories;
      const targets = effectiveComplexityTargets(energy, overrides);
      const filtered = candidates.filter((sub) => {
        const effComplexity =
          energy && sub.energyLevel === energy && sub.energyComplexity
            ? sub.energyComplexity
            : sub.complexity;
        if (!targets.includes(effComplexity)) return false;
        const key = categoryKeyById.get(sub.categoryId) ?? null;
        return isEnergyCompatible(key, energy);
      });
      candidates = filtered.length > 0 ? filtered : subcategories;
    }

    const now = Date.now();
    const fallbackMinutes = energy ? ENERGY_RECOMMENDED_DURATION[energy] : 25;
    const minutes = preferredMinutes ?? fallbackMinutes;
    const preferred = energy ? preferredComplexity(energy, minutes) : "MEDIUM";

    const scored = candidates
      .map((subcategory) => {
        const lastPracticedAt = lastPracticedBySubcategory.get(subcategory.id);
        const days = lastPracticedAt ? daysSince(lastPracticedAt, now) : Infinity;
        const category = categoryById.get(subcategory.categoryId);

        const recencyScore =
          days === Infinity ? 1 : Math.min(days / RECENCY_WINDOW_DAYS, 1);
        const effectiveSubComplexity = energy && subcategory.energyLevel === energy && subcategory.energyComplexity
          ? subcategory.energyComplexity
          : subcategory.complexity;
        const subFitScore = energy ? complexityFit(preferred, effectiveSubComplexity) : 1;
        const effectiveCatComplexity = energy && category && category.energyLevel === energy && category.energyComplexity
          ? category.energyComplexity
          : (category?.complexity ?? null);
        const categoryFitScore =
          energy && effectiveCatComplexity
            ? complexityFit(preferred, effectiveCatComplexity)
            : 1;
        const fitScore = (subFitScore + categoryFitScore) / 2;
        const score = recencyScore * RECENCY_WEIGHT + fitScore * COMPLEXITY_WEIGHT;

        return { subcategory, category, days, score };
      })
      .sort((a, b) => b.score - a.score || b.days - a.days);

    return scored.slice(0, limit).map(({ subcategory, category, days }) => {
      let suggestedMinutes = minutes;
      if (energy) {
        const preferredForComplexity = suggestedMinutesFor(
          energy,
          subcategory.complexity,
          overrides,
        );
        suggestedMinutes = Math.min(
          suggestedMinutes,
          preferredForComplexity,
          effectiveEnergyMax(energy, overrides),
        );
      }

      return {
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
        subcategoryIcon: subcategory.icon,
        subcategoryColor: subcategory.color,
        categoryName: category?.name ?? "",
        reason: formatRecommendationReason(days === Infinity ? null : days),
        suggestedMinutes,
        energyLevel: energy ?? undefined,
        complexity: subcategory.complexity,
        categoryComplexity: category?.complexity ?? undefined,
      };
    });
  },
};
