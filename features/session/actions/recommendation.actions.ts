"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { ruleBasedRecommendationService } from "@/services/recommendation/rule-based-recommendation.service";
import { saveFeedbackForUser } from "@/services/recommendation/feedback.service";
import type {
  EnergyLevel,
  EnergyOverrides,
} from "@/services/recommendation/energy-level";

export async function getRecommendationAction(
  energy?: EnergyLevel,
  preferredMinutes?: number,
  overrides?: EnergyOverrides,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "No autenticado." };
  }

  try {
    const recommendation = await ruleBasedRecommendationService.getRecommendation(
      session.user.id,
      energy,
      preferredMinutes,
      overrides,
    );
    return { success: true as const, recommendation };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Error al obtener recomendación.",
    };
  }
}

export async function getRecommendationsAction(
  energy?: EnergyLevel,
  preferredMinutes?: number,
  limit = 6,
  overrides?: EnergyOverrides,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "No autenticado." };
  }

  try {
    const recommendations = await ruleBasedRecommendationService.getRecommendations(
      session.user.id,
      energy,
      preferredMinutes,
      limit,
      overrides,
    );
    return { success: true as const, recommendations };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Error al obtener recomendaciones.",
    };
  }
}

const feedbackSchema = z.object({
  subcategoryId: z.string().cuid("Identificador inválido."),
  value: z.union([z.literal(1), z.literal(-1), z.null()]),
});

export async function saveFeedbackAction(input: unknown) {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Feedback inválido." };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "No autenticado." };
  }
  try {
    const value = await saveFeedbackForUser(
      session.user.id,
      parsed.data.subcategoryId,
      parsed.data.value,
    );
    return { success: true as const, value };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Error al guardar feedback.",
    };
  }
}
