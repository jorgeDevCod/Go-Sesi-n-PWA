import type { Complexity } from "@/lib/constants/default-subcategories";
import {
  filterSubcategoriesByEnergy,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";

type HasComplexity = { complexity: Complexity };

/**
 * Orden de complejidad por energía: con mucha, retos difíciles primero; con
 * media, lo cotidiano (MEDIUM) primero; con poca, lo más simple primero.
 */
const ENERGY_COMPLEXITY_ORDER: Record<EnergyLevel, Complexity[]> = {
  alta: ["HIGH", "MEDIUM", "LOW"],
  media: ["MEDIUM", "LOW", "HIGH"],
  baja: ["LOW", "MEDIUM", "HIGH"],
};

/**
 * Ordena actividades según la energía del usuario: con mucha energía las
 * actividades más exigentes primero; con poca, las más ligeras primero.
 */
export function sortActivitiesByEnergy<T extends HasComplexity>(
  items: T[],
  energy: EnergyLevel,
): T[] {
  const order = new Map(ENERGY_COMPLEXITY_ORDER[energy].map((complexity, index) => [complexity, index]));
  return [...items].sort(
    (a, b) => (order.get(a.complexity) ?? 1) - (order.get(b.complexity) ?? 1),
  );
}

/**
 * Filtra según la complejidad adecuada al nivel de energía (con fallback a
 * todas si el filtro queda vacío) y luego ordena. La primera de la lista es la
 * "más promedio" para ese nivel de energía.
 */
export function prepareActivitiesForEnergy<T extends HasComplexity>(
  items: T[],
  energy: EnergyLevel,
  targets?: Complexity[],
): T[] {
  return sortActivitiesByEnergy(
    filterSubcategoriesByEnergy(items, energy, targets),
    energy,
  );
}
