const DAY_MS = 24 * 60 * 60 * 1000;

export function daysSince(date: Date, nowMs: number = Date.now()): number {
  return Math.max(0, Math.floor((nowMs - date.getTime()) / DAY_MS));
}

/** `daysSincePractice === null` means the subcategory has never been practiced. */
export function formatRecommendationReason(daysSincePractice: number | null): string {
  if (daysSincePractice === null) return "Todavía no la has probado.";
  if (daysSincePractice === 0) return "La practicaste hoy-puedes seguir con ella.";
  if (daysSincePractice === 1) return "Hace 1 día que no la practicas.";
  return `Hace ${daysSincePractice} días que no la practicas.`;
}
