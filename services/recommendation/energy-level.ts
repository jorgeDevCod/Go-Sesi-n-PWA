import type { Complexity } from "@/lib/constants/default-subcategories";

export type EnergyLevel = "baja" | "media" | "alta";

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  baja: "Estoy agotado",
  media: "Estoy bien",
  alta: "Estoy lleno de energía",
};

export const ENERGY_DESCRIPTIONS: Record<EnergyLevel, string> = {
  baja: "Algo ligero, sin presión.",
  media: "Ritmo constante, al grano.",
  alta: "¡Vamos con todo!",
};

export const ENERGY_ICONS: Record<EnergyLevel, string> = {
  baja: "BatteryLow",
  media: "BatteryMedium",
  alta: "BatteryFull",
};

export const ENERGY_COLORS: Record<EnergyLevel, string> = {
  baja: "#F59E0B",
  media: "#22C55E",
  alta: "#6366F1",
};

/** Texto legible sobre cada color de energía (contraste WCAG AA). */
export const ENERGY_TEXT: Record<EnergyLevel, string> = {
  baja: "#4a2d00", // ámbar claro → texto oscuro
  media: "#ffffff",
  alta: "#ffffff",
};

/** Tinte suave para usar como fondo de cards/chips antes o sin seleccionar. */
export const ENERGY_TINT: Record<EnergyLevel, string> = {
  baja: "rgba(245, 158, 11, 0.12)",
  media: "rgba(34, 197, 94, 0.10)",
  alta: "rgba(99, 102, 241, 0.10)",
};

/** Tinte un poco más oscuro para el estado de hover de los botones. */
export const ENERGY_TINT_HOVER: Record<EnergyLevel, string> = {
  baja: "rgba(245, 158, 11, 0.22)",
  media: "rgba(34, 197, 94, 0.18)",
  alta: "rgba(99, 102, 241, 0.18)",
};

export const CATEGORY_ENERGY_KEYS: Record<string, EnergyLevel[]> = {
  aprender: ["alta", "media"],
  salud: ["media", "alta"],
  entrenamiento: ["alta", "media", "baja"],
  diversion: ["baja", "media", "alta"],
  finanzas: ["media"],
  "descanso-consciente": ["baja"],
  trabajo: ["alta", "media"],
};

/**
 * Duración recomendada (la opción "más promedio") por nivel de energía.
 * - baja: algo corto y ligero.
 * - media: el punto medio clásico de enfoque.
 * - alta: tiempo regular-alto para retos exigentes.
 */
export const ENERGY_RECOMMENDED_DURATION: Record<EnergyLevel, number> = {
  baja: 30,
  media: 50,
  alta: 75,
};

/** Opciones de duración mostradas por nivel de energía (la recomendada va Te recomendamos!!). */
export const ENERGY_DURATION_OPTIONS: Record<EnergyLevel, number[]> = {
  baja: [25, 30, 35, 40],
  media: [45, 50, 55, 60],
  alta: [60, 75, 90],
};

/** Límite máximo de duración por nivel de energía. */
export const ENERGY_MAX_MINUTES: Record<EnergyLevel, number> = {
  baja: 40,
  media: 60,
  alta: 90,
};

/** Etiqueta legible del límite máximo por nivel de energía. */
export const ENERGY_MAX_LABEL: Record<EnergyLevel, string> = {
  baja: "máx. 40 min",
  media: "máx. 1 hora",
  alta: "hasta 1 h 30",
};

/** Mínimo por defecto de cada nivel de energía (primer chip disponible). */
export const ENERGY_MIN_MINUTES: Record<EnergyLevel, number> = {
  baja: Math.min(...ENERGY_DURATION_OPTIONS.baja),
  media: Math.min(...ENERGY_DURATION_OPTIONS.media),
  alta: Math.min(...ENERGY_DURATION_OPTIONS.alta),
};

/** Límites por dificultad: solo aplican cuando el usuario los personaliza. */
export const DIFFICULTY_MIN_DURATION: Record<Complexity, number> = {
  LOW: 25,
  MEDIUM: 45,
  HIGH: 60,
};
export const DIFFICULTY_MAX_DURATION: Record<Complexity, number> = {
  LOW: 40,
  MEDIUM: 60,
  HIGH: 90,
};

/** Qué tipo de tareas encajan por nivel de energía. */
export const ENERGY_ACTIVITY_DESCRIPTIONS: Record<EnergyLevel, string> = {
  baja: "solo tareas simples y ligeras",
  media: "tareas normales y cotidianas",
  alta: "tareas desafiantes",
};

/**
 * Complejidades preferidas por nivel de energía (el filtro cae a todas si no hay
 * coincidencias). Con energía alta priorizamos retos; con media, lo cotidiano;
 * con baja, solo lo simple.
 */
export const ENERGY_COMPLEXITY_TARGETS: Record<EnergyLevel, Complexity[]> = {
  baja: ["LOW"],
  media: ["LOW", "MEDIUM"],
  alta: ["MEDIUM", "HIGH"],
};

/**
 * Personalización del usuario para las recomendaciones. Todos los campos son
 * opcionales: donde no haya valor se usan las constantes por defecto.
 * - `energyDurations` / `difficultyDurations`: tiempo recomendado.
 * - `energyMinDurations` / `energyMaxDurations`: límites por energía.
 * - `difficultyMinDurations` / `difficultyMaxDurations`: límites por dificultad.
 * - `energyComplexityTargets`: dificultades a mostrar por energía.
 * - `combos`: config por combinación `${energy}:${complexity}` (min/rec/máx + tiempos custom).
 */
export type EnergyCombo = {
  min: number;
  rec: number;
  max: number;
  customTimes: number[];
};

export type EnergyOverrides = {
  energyDurations?: Partial<Record<EnergyLevel, number>>;
  energyMinDurations?: Partial<Record<EnergyLevel, number>>;
  energyMaxDurations?: Partial<Record<EnergyLevel, number>>;
  energyComplexityTargets?: Partial<Record<EnergyLevel, Complexity[]>>;
  difficultyDurations?: Partial<Record<Complexity, number>>;
  difficultyMinDurations?: Partial<Record<Complexity, number>>;
  difficultyMaxDurations?: Partial<Record<Complexity, number>>;
  energyCategoryIds?: Partial<Record<EnergyLevel, string[]>>;
  energySubcategoryIds?: Partial<Record<EnergyLevel, string[]>>;
  combos?: Record<string, EnergyCombo>;
};

/** Combo configurado para una combinación energía + dificultad. */
export function comboFor(
  energy: EnergyLevel,
  complexity: Complexity,
  overrides?: EnergyOverrides,
): EnergyCombo | undefined {
  return overrides?.combos?.[`${energy}:${complexity}`];
}

/** Duración recomendada efectiva para una energía (custom del usuario o constante). */
export function effectiveRecommendedDuration(
  energy: EnergyLevel,
  overrides?: EnergyOverrides,
): number {
  return overrides?.energyDurations?.[energy] ?? ENERGY_RECOMMENDED_DURATION[energy];
}

/** Límite mínimo efectivo de una energía (custom o por defecto). */
export function effectiveEnergyMin(
  energy: EnergyLevel,
  overrides?: EnergyOverrides,
): number {
  return overrides?.energyMinDurations?.[energy] ?? ENERGY_MIN_MINUTES[energy];
}

/** Límite máximo efectivo de una energía (custom o por defecto). */
export function effectiveEnergyMax(
  energy: EnergyLevel,
  overrides?: EnergyOverrides,
): number {
  return overrides?.energyMaxDurations?.[energy] ?? ENERGY_MAX_MINUTES[energy];
}

/** Límite mínimo efectivo de una dificultad (custom o por defecto). */
export function effectiveDifficultyMin(
  complexity: Complexity,
  overrides?: EnergyOverrides,
): number {
  return overrides?.difficultyMinDurations?.[complexity] ?? DIFFICULTY_MIN_DURATION[complexity];
}

/** Límite máximo efectivo de una dificultad (custom o por defecto). */
export function effectiveDifficultyMax(
  complexity: Complexity,
  overrides?: EnergyOverrides,
): number {
  return overrides?.difficultyMaxDurations?.[complexity] ?? DIFFICULTY_MAX_DURATION[complexity];
}

/** Etiqueta legible de un máximo de minutos ("máx. 1 hora", "máx. 45 min"...). */
export function formatMaxLabel(max: number): string {
  if (max >= 60) {
    const hours = Math.floor(max / 60);
    const rest = max % 60;
    if (rest === 0) return hours === 1 ? "máx. 1 hora" : `máx. ${hours} horas`;
    return `máx. ${hours} h ${rest} min`;
  }
  return `máx. ${max} min`;
}

/** Etiqueta legible del máximo efectivo de una energía. */
export function effectiveMaxLabel(
  energy: EnergyLevel,
  overrides?: EnergyOverrides,
): string {
  return formatMaxLabel(effectiveEnergyMax(energy, overrides));
}

/** Opciones de duración efectivas (chips) para una energía, dentro de [mín, máx]. */
export function effectiveDurationOptions(
  energy: EnergyLevel,
  overrides?: EnergyOverrides,
): number[] {
  const min = effectiveEnergyMin(energy, overrides);
  const max = Math.max(effectiveEnergyMax(energy, overrides), min);
  const rec = Math.min(
    Math.max(effectiveRecommendedDuration(energy, overrides), min),
    max,
  );
  const options = new Set<number>(
    ENERGY_DURATION_OPTIONS[energy].filter((m) => m >= min && m <= max),
  );
  options.add(min).add(max).add(rec);
  // Incluye tiempos custom de cualquier combo de esta energía
  const prefix = `${energy}:`;
  for (const [key, combo] of Object.entries(overrides?.combos ?? {})) {
    if (key.startsWith(prefix) && combo.customTimes) {
      for (const t of combo.customTimes) options.add(t);
    }
  }
  return [...options].sort((a, b) => a - b);
}

/** Complejidades a mostrar efectivas para una energía (custom del usuario o constante). */
export function effectiveComplexityTargets(
  energy: EnergyLevel,
  overrides?: EnergyOverrides,
): Complexity[] {
  return overrides?.energyComplexityTargets?.[energy] ?? ENERGY_COMPLEXITY_TARGETS[energy];
}

/**
 * Minutos sugeridos efectivos para una actividad según su complejidad.
 * Precedencia: duración por dificultad → duración por energía → constante,
 * siempre acotado por los límites mín/máx de energía y de dificultad.
 */
export function suggestedMinutesFor(
  energy: EnergyLevel,
  complexity: Complexity,
  overrides?: EnergyOverrides,
): number {
  const combo = comboFor(energy, complexity, overrides);
  if (combo) {
    return combo.rec;
  }
  const difficultyOverride = overrides?.difficultyDurations?.[complexity];
  const base = difficultyOverride ?? effectiveRecommendedDuration(energy, overrides);
  const lower = Math.max(
    effectiveEnergyMin(energy, overrides),
    effectiveDifficultyMin(complexity, overrides),
  );
  const upper = Math.min(
    effectiveEnergyMax(energy, overrides),
    effectiveDifficultyMax(complexity, overrides),
  );
  return Math.min(Math.max(base, lower), upper);
}

export const COMPLEXITY_LABELS: Record<Complexity, string> = {
  LOW: "Ligera",
  MEDIUM: "Moderada",
  HIGH: "Intensa",
};

/** Límite máximo de duración por nivel de energía. */
export function energyMaxMinutes(energy: EnergyLevel): number {
  return ENERGY_MAX_MINUTES[energy];
}

export function energyMessage(energy: EnergyLevel): string {
  switch (energy) {
    case "baja":
      return "Hoy toca algo ligero. Haremos poco pero bien.";
    case "media":
      return "Tienes buen ritmo. Aprovechémoslo.";
    case "alta":
      return "¡Energía al máximo! A darlo todo.";
  }
}

export function isEnergyCompatible(
  categoryKey: string | null,
  energy: EnergyLevel,
): boolean {
  if (!categoryKey) return true;
  const allowed = CATEGORY_ENERGY_KEYS[categoryKey];
  if (!allowed) return true;
  return allowed.includes(energy);
}

/**
 * Qué complejidad de actividad se ajusta mejor a la energía y el tiempo
 * disponible:
 * - Energía alta + tiempo → retos intensos.
 * - Energía media → lo normal y cotidiano (MEDIUM).
 * - Energía baja → siempre algo simple (LOW).
 */
export function preferredComplexity(
  energy: EnergyLevel,
  minutes: number,
): Complexity {
  switch (energy) {
    case "alta":
      return minutes >= 30 ? "HIGH" : "MEDIUM";
    case "media":
      return "MEDIUM";
    case "baja":
      return "LOW";
  }
}

/**
 * Filtra actividades según la complejidad adecuada al nivel de energía.
 * Si el filtro se queda vacío devuelve todas (fallback para no dejar sin
 * opciones al usuario). `targets` permite aplicar una personalización.
 */
export function filterSubcategoriesByEnergy<T extends { complexity: Complexity }>(
  items: T[],
  energy: EnergyLevel | undefined,
  targets: Complexity[] | undefined = energy ? ENERGY_COMPLEXITY_TARGETS[energy] : undefined,
): T[] {
  if (!energy || !targets) return items;
  const compatible = items.filter((item) => targets.includes(item.complexity));
  return compatible.length > 0 ? compatible : items;
}

/** Mensaje breve para la sección de duración según la energía elegida. */
export function energyDurationHint(
  energy: EnergyLevel,
  overrides?: EnergyOverrides,
): string {
  return `Con energía ${
    energy === "baja" ? "baja" : energy === "media" ? "media" : "alta"
  }: ${ENERGY_ACTIVITY_DESCRIPTIONS[energy]} · ${effectiveMaxLabel(energy, overrides)}`;
}

const COMPLEXITY_RANK: Record<Complexity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

/** Coincidencia entre la complejidad preferida y la real (1 exacta, 0.6 adyacente, 0.2 lejana). */
export function complexityFit(preferred: Complexity, actual: Complexity): number {
  const diff = Math.abs(COMPLEXITY_RANK[preferred] - COMPLEXITY_RANK[actual]);
  if (diff === 0) return 1;
  if (diff === 1) return 0.6;
  return 0.2;
}
