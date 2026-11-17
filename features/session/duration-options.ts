import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";

export type DurationProfile = "low" | "medium" | "high";

/** Topes de duración por perfil (minutos). */
export const DURATION_PROFILE_MAX: Record<DurationProfile, number> = {
  low: 60,
  medium: 90,
  high: 150,
};

export function durationProfileFor(
  energy?: EnergyLevel,
  complexity?: Complexity,
): DurationProfile {
  if (energy === "alta" || complexity === "HIGH") return "high";
  if (energy === "baja") return "low";
  return "medium";
}

function roundDownToFive(value: number): number {
  return Math.max(5, Math.floor(value / 5) * 5);
}

/**
 * Genera los tiempos visibles alrededor del tiempo elegido.
 *
 * - Perfil alto: progresión 15 + 15 + 30 (o 20 + 20 + 40 según el tiempo).
 * - Perfil medio: pasos de 20 minutos.
 * - Perfil bajo: pasos de la mitad del tiempo, con tope de 60.
 */
export function buildDurationOptions({
  selectedMinutes,
  profile,
  recommendedMinutes,
  maxMinutes = DURATION_PROFILE_MAX[profile],
}: {
  selectedMinutes: number;
  profile: DurationProfile;
  recommendedMinutes?: number;
  maxMinutes?: number;
}): number[] {
  const selected = Math.max(1, Math.round(selectedMinutes));
  const upper = Math.max(maxMinutes, selected);
  let step: number;
  let previous: number;
  let forward: number[];

  if (profile === "high") {
    step = Math.min(30, Math.max(15, roundDownToFive(selected / 2)));
    previous = selected - step;
    forward = [selected + step, selected + step * 2, selected + step * 4];
  } else if (profile === "medium") {
    step = 20;
    previous =
      selected <= 30 ? roundDownToFive(selected / 2) : selected - step;
    forward = [selected + step, selected + step * 2, selected + step * 3];
  } else {
    step = roundDownToFive(selected / 2);
    previous = selected - step;
    forward = [selected + step, selected + step * 2, selected + step * 3];
  }

  const options = new Set<number>();
  if (previous > 0) options.add(previous);
  options.add(selected);
  for (const value of forward) {
    options.add(Math.min(upper, value));
  }
  if (recommendedMinutes && recommendedMinutes > 0) {
    options.add(recommendedMinutes);
  }

  return [...options].sort((a, b) => a - b);
}
