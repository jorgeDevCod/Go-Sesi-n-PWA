import type { EnergyLevel, EnergyOverrides } from "./energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

export type Recommendation = {
  subcategoryId: string;
  subcategoryName: string;
  subcategoryIcon: string;
  subcategoryColor: string;
  categoryName: string;
  reason: string;
  suggestedMinutes?: number;
  energyLevel?: EnergyLevel;
  complexity?: Complexity;
  categoryComplexity?: Complexity;
  /** Feedback explícito del usuario (7B), si existe. */
  feedback?: 1 | -1 | null;
};

export interface RecommendationService {
  getRecommendation(
    userId: string,
    energy?: EnergyLevel,
    preferredMinutes?: number,
    overrides?: EnergyOverrides,
    options?: { nowMs?: number },
  ): Promise<Recommendation | null>;
  getRecommendations(
    userId: string,
    energy?: EnergyLevel,
    preferredMinutes?: number,
    limit?: number,
    overrides?: EnergyOverrides,
    options?: { nowMs?: number },
  ): Promise<Recommendation[]>;
}
