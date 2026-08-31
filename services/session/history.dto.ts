import type { SessionWithRelations } from "./session.dto";

export type SessionHistoryEntry = {
  id: string;
  status: "COMPLETED" | "INTERRUPTED";
  startedAtMs: number;
  endedAtMs: number | null;
  plannedMinutes: number;
  actualMinutes: number;
  extendedCount: number;
  extendedMinutes: number;
  leftoverMinutes: number;
  subcategoryName: string;
  subcategoryIcon: string;
  subcategoryColor: string;
  categoryName: string;
};

export function toSessionHistoryEntry(session: SessionWithRelations): SessionHistoryEntry {
  const actualMinutes = session.actualMinutes ?? 0;

  return {
    id: session.id,
    status: session.status as "COMPLETED" | "INTERRUPTED",
    startedAtMs: session.startedAt.getTime(),
    endedAtMs: session.endedAt ? session.endedAt.getTime() : null,
    plannedMinutes: session.plannedMinutes,
    actualMinutes,
    extendedCount: session.extendedCount,
    extendedMinutes: session.extendedMinutes,
    leftoverMinutes: Math.max(0, session.plannedMinutes - actualMinutes),
    subcategoryName: session.subcategory.name,
    subcategoryIcon: session.subcategory.icon,
    subcategoryColor: session.subcategory.color,
    categoryName: session.subcategory.category.name,
  };
}
