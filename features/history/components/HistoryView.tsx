"use client";

import { useState, useTransition } from "react";
import { formatDayLabel, groupSessionsByDay } from "@/features/history/group-by-day";
import { SessionNoteCard } from "@/features/history/components/SessionNoteCard";
import { DismissibleHint } from "@/components/ui/DismissibleHint";
import { deleteSessionHistoryAction } from "@/features/session/actions/session.actions";
import type { SessionHistoryEntry } from "@/services/session/history.dto";

export function HistoryView({ entries: initialEntries }: { entries: SessionHistoryEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [, startTransition] = useTransition();

  function handleDelete(entry: SessionHistoryEntry) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`¿Eliminar esta sesión de "${entry.subcategoryName}" del historial?`)
    ) {
      return;
    }
    const previous = entries;
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    startTransition(async () => {
      const result = await deleteSessionHistoryAction({ id: entry.id });
      if (!result.success) {
        setEntries(previous);
      }
    });
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no completaste ninguna sesión. Cuando termines una, aparecerá aquí.
      </p>
    );
  }

  const groups = groupSessionsByDay(entries);

  return (
    <div className="flex flex-col gap-8">
      <DismissibleHint storageKey="gosession-hint-history-seen">
        Cada nota tiene el color de su subcategoría. Verde significa que completaste el
        tiempo planeado; ámbar, que la finalizaste antes de tiempo.
      </DismissibleHint>

      {groups.map((group) => {
        const { date, dayName } = formatDayLabel(group.dateKey);
        return (
          <section key={group.dateKey} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              {date} · {dayName}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.entries.map((entry) => (
                <SessionNoteCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => handleDelete(entry)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
