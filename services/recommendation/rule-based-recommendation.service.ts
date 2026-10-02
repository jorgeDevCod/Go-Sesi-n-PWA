import { listSubcategoriesByUser } from "@/repositories/subcategory.repository";
import {
  getCompletionBySubcategory,
  getLastPracticedAtBySubcategory,
} from "@/repositories/focus-session.repository";
import { getFeedbackMap } from "@/repositories/recommendation-feedback.repository";
import { listCategoriesForUser } from "@/repositories/category.repository";
import { getTodayPlan } from "@/services/planning/daily-plan.service";
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
const RECENCY_WEIGHT = 0.4;
const COMPLEXITY_WEIGHT = 0.4;
/** Bonus fijo por estar en el plan de hoy (v2). */
const PLAN_BONUS = 0.15;
/** Peso de la tasa de completado (v2): impulsa lo que sí terminas. */
const COMPLETION_WEIGHT = 0.1;
/** Peso del 👍 explícito (v2). El 👎 excluye (no solo resta). */
const LIKED_BONUS = 0.1;
/** Desde esta hora Lima, sugerencias cortas para cerrar el día (v2). */
const EVENING_HOUR = 20;
const EVENING_MAX_MINUTES = 25;
const DAY_TIME_ZONE = process.env.APP_TIMEZONE ?? "America/Lima";

/** Hora 0-23 en la zona indicada, para la señal "momento del día". */
export function hourInTimeZone(nowMs: number, timeZone: string = DAY_TIME_ZONE): number {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hour12: false }).format(
      new Date(nowMs),
    ),
  );
}

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
  async getRecommendation(userId, energy, preferredMinutes, overrides, options) {
    const list = await this.getRecommendations(userId, energy, preferredMinutes, 1, overrides, options);
    return list[0] ?? null;
  },

  /**
   * Ranking de recomendaciones por energía: filtra actividades según la
   * complejidad adecuada al nivel de energía y las ordena por ajuste.
   * Señales v2 (aditivas, pesos pequeños): plan de hoy (+0.15), tasa de
   * completado (+0.1×tasa) y tope nocturno en sugeridos (≥20h Lima → 25 min).
   * La primera sigue siendo la "más promedio" para ese nivel de energía.
   * `overrides` permite aplicar la personalización del usuario (tiempos y
   * dificultades).
   */
  async getRecommendations(
    userId: string,
    energy?: EnergyLevel,
    preferredMinutes?: number,
    limit = 6,
    overrides?: EnergyOverrides,
    options?: { nowMs?: number },
  ): Promise<Recommendation[]> {
    const [
      subcategories,
      categories,
      lastPracticedBySubcategory,
      todayPlan,
      completionBySub,
      feedbackMap,
    ] = await Promise.all([
      listSubcategoriesByUser(userId),
      listCategoriesForUser(userId),
      getLastPracticedAtBySubcategory(userId),
      getTodayPlan(userId),
      getCompletionBySubcategory(userId),
      getFeedbackMap(userId),
    ]);

    if (subcategories.length === 0) return [];

    // 👎 explícito: se respeta siempre (incluso si no quedara nada).
    const candidates0 = subcategories.filter((sub) => feedbackMap.get(sub.id) !== -1);
    if (candidates0.length === 0) return [];

    const plannedSubIds = new Set(
      (todayPlan?.items ?? [])
        .map((item) => item.subcategoryId)
        .filter((id): id is string => id !== null),
    );

    const categoryById = new Map<string, Category>(categories.map((category) => [category.id, category]));
    const categoryKeyById = new Map<string, string | null>(
      categories.map((category) => [category.id, category.key]),
    );

    let candidates: Subcategory[] = candidates0;

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
      if (candidates.length === 0) candidates = candidates0;
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
      candidates = filtered.length > 0 ? filtered : candidates0;
    }

    const now = options?.nowMs ?? Date.now();
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
        const inPlan = plannedSubIds.has(subcategory.id);
        const completion = completionBySub.get(subcategory.id);
        const completionRate =
          completion && completion.total > 0 ? completion.completed / completion.total : 0;
        const liked = feedbackMap.get(subcategory.id) === 1;
        const score =
          recencyScore * RECENCY_WEIGHT +
          fitScore * COMPLEXITY_WEIGHT +
          (inPlan ? PLAN_BONUS : 0) +
          completionRate * COMPLETION_WEIGHT +
          (liked ? LIKED_BONUS : 0);

        return { subcategory, category, days, score, inPlan, liked };
      })
      .sort((a, b) => b.score - a.score || b.days - a.days);

    const eveningCap = hourInTimeZone(now) >= EVENING_HOUR;

    return scored.slice(0, limit).map(({ subcategory, category, days, inPlan, liked }) => {
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
      if (eveningCap) {
        suggestedMinutes = Math.min(suggestedMinutes, EVENING_MAX_MINUTES);
      }

      const baseReason = formatRecommendationReason(days === Infinity ? null : days);
      const planSuffix = inPlan ? " Está en tu plan de hoy." : "";
      const likedSuffix = liked ? " De tus favoritas." : "";
      return {
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
        subcategoryIcon: subcategory.icon,
        subcategoryColor: subcategory.color,
        categoryName: category?.name ?? "",
        reason: `${baseReason}${planSuffix}${likedSuffix}`,
        suggestedMinutes,
        energyLevel: energy ?? undefined,
        complexity: subcategory.complexity,
        categoryComplexity: category?.complexity ?? undefined,
        feedback: feedbackMap.get(subcategory.id) ?? null,
      };
    });
  },
};
