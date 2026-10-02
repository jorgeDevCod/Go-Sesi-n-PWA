import type { FocusSession, Subcategory, Category } from "@/lib/generated/prisma/client";
import type { PomodoroConfig } from "./pomodoro";

export type SessionWithRelations = FocusSession & {
  subcategory: Subcategory & { category: Category };
};

export type SessionDTO = {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "INTERRUPTED";
  startedAtMs: number;
  endedAtMs: number | null;
  plannedMinutes: number;
  actualMinutes: number | null;
  pausedMs: number;
  pausedAtMs: number | null;
  extendedCount: number;
  extendedMinutes: number;
  mode: "CLASSIC" | "POMODORO";
  /** Config validada o null (nunca rompe la UI con JSON corrupto). */
  pomodoroConfig: PomodoroConfig | null;
  subcategoryId: string;
  subcategoryName: string;
  subcategoryIcon: string;
  subcategoryColor: string;
  categoryName: string;
  serverNowMs: number;
};

/**
 * Lee pomodoroConfig defensivamente: JSON corrupto o parcial → null,
 * nunca rompe el DTO ni la UI. La escritura ya se valida en el servicio.
 */
export function parsePomodoroConfig(value: unknown): PomodoroConfig | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (
    !Number.isInteger(v.focusMin) ||
    !Number.isInteger(v.breakMin) ||
    !Number.isInteger(v.cycles) ||
    typeof v.autoStart !== "boolean"
  ) {
    return null;
  }
  return {
    focusMin: v.focusMin as number,
    breakMin: v.breakMin as number,
    cycles: v.cycles as number,
    autoStart: v.autoStart as boolean,
  };
}

export function toSessionDTO(
  session: SessionWithRelations,
  serverNowMs: number = Date.now(),
): SessionDTO {
  return {
    id: session.id,
    status: session.status,
    startedAtMs: session.startedAt.getTime(),
    endedAtMs: session.endedAt ? session.endedAt.getTime() : null,
    plannedMinutes: session.plannedMinutes,
    actualMinutes: session.actualMinutes,
    pausedMs: session.pausedMs,
    pausedAtMs: session.pausedAt ? session.pausedAt.getTime() : null,
    extendedCount: session.extendedCount,
    extendedMinutes: session.extendedMinutes,
    mode: session.mode,
    pomodoroConfig: session.mode === "POMODORO" ? parsePomodoroConfig(session.pomodoroConfig) : null,
    subcategoryId: session.subcategoryId,
    subcategoryName: session.subcategory.name,
    subcategoryIcon: session.subcategory.icon,
    subcategoryColor: session.subcategory.color,
    categoryName: session.subcategory.category.name,
    serverNowMs,
  };
}
