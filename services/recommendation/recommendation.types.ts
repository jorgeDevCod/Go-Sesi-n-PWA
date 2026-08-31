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
};

export interface RecommendationService {
  getRecommendation(
    userId: string,
    energy?: EnergyLevel,
    preferredMinutes?: number,
    overrides?: EnergyOverrides,
  ): Promise<Recommendation | null>;
  getRecommendations(
    userId: string,
    energy?: EnergyLevel,
    preferredMinutes?: number,
    limit?: number,
    overrides?: EnergyOverrides,
  ): Promise<Recommendation[]>;
}
