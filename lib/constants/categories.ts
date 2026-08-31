import type { Complexity } from "./default-subcategories";

export const CATEGORY_SEED = [
  {
    key: "aprender",
    name: "Aprender",
    icon: "BookOpen",
    color: "#6366F1",
    order: 0,
    complexity: "HIGH" as const,
  },
  {
    key: "salud",
    name: "Salud",
    icon: "HeartPulse",
    color: "#22C55E",
    order: 1,
    complexity: "MEDIUM" as const,
  },
  {
    key: "entrenamiento",
    name: "Entrenamiento",
    icon: "Activity",
    color: "#EF4444",
    order: 2,
    complexity: "HIGH" as const,
  },
  {
    key: "diversion",
    name: "Diversión",
    icon: "Gamepad2",
    color: "#EC4899",
    order: 3,
    complexity: "LOW" as const,
  },
  {
    key: "finanzas",
    name: "Finanzas",
    icon: "Wallet",
    color: "#F59E0B",
    order: 4,
    complexity: "MEDIUM" as const,
  },
  {
    key: "descanso-consciente",
    name: "Descanso consciente",
    icon: "Sparkles",
    color: "#14B8A6",
    order: 5,
    complexity: "LOW" as const,
  },
  {
    key: "trabajo",
    name: "Trabajo",
    icon: "Briefcase",
    color: "#8B5CF6",
    order: 6,
    complexity: "HIGH" as const,
  },
] as const;

export type CategoryKey = (typeof CATEGORY_SEED)[number]["key"];

export const CATEGORY_COMPLEXITY_BY_KEY: Record<string, Complexity> = Object.fromEntries(
  CATEGORY_SEED.map((seed) => [seed.key, seed.complexity]),
);

/**
 * Bump this whenever the default category/activity banks are expanded so
 * existing accounts get the new seeds on their next visit (see
 * `ensureDefaultCategoriesForUser`).
 */
export const CURRENT_SEED_VERSION = 2;
