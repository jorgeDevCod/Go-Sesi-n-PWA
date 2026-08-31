/**
 * Groups history entries by local calendar day. Deliberately uses the
 * runtime's local Date getters (not UTC) so "today" always matches what the
 * viewer's own clock/timezone says-this only ever runs client-side.
 */

export type DayGroup<T> = {
  dateKey: string;
  entries: T[];
};

function toDateKey(ms: number): string {
  const date = new Date(ms);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function groupSessionsByDay<T extends { startedAtMs: number }>(
  entries: readonly T[],
): DayGroup<T>[] {
  const byDay = new Map<string, T[]>();

  for (const entry of entries) {
    const key = toDateKey(entry.startedAtMs);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      byDay.set(key, [entry]);
    }
  }

  return Array.from(byDay.entries())
    .map(([dateKey, dayEntries]) => ({ dateKey, entries: dayEntries }))
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));
}

export function formatDayLabel(dateKey: string): { date: string; dayName: string } {
  const [year, month, day] = dateKey.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  const date = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  const rawDayName = new Intl.DateTimeFormat("es", { weekday: "long" }).format(localDate);
  const dayName = rawDayName.charAt(0).toUpperCase() + rawDayName.slice(1);

  return { date, dayName };
}
