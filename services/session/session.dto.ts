import type { FocusSession, Subcategory, Category } from "@/lib/generated/prisma/client";

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
  subcategoryId: string;
  subcategoryName: string;
  subcategoryIcon: string;
  subcategoryColor: string;
  categoryName: string;
  serverNowMs: number;
};

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
    subcategoryId: session.subcategoryId,
    subcategoryName: session.subcategory.name,
    subcategoryIcon: session.subcategory.icon,
    subcategoryColor: session.subcategory.color,
    categoryName: session.subcategory.category.name,
    serverNowMs,
  };
}
