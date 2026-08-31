import { X } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import type { SessionHistoryEntry } from "@/services/session/history.dto";

function formatTimeRange(startedAtMs: number, endedAtMs: number | null): string {
  const startLabel = new Date(startedAtMs).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!endedAtMs) return startLabel;
  const endLabel = new Date(endedAtMs).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startLabel} – ${endLabel}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function SessionNoteCard({
  entry,
  onDelete,
}: {
  entry: SessionHistoryEntry;
  onDelete: () => void;
}) {
  const isCompleted = entry.status === "COMPLETED";

  return (
    <div
      style={{ backgroundColor: `${entry.subcategoryColor}1f` }}
      className="relative flex w-full flex-col gap-2 rounded-2xl border border-border p-4 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Eliminar sesión de ${entry.subcategoryName}`}
        title="Eliminar"
        className="absolute top-2 right-2 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/5 text-muted-foreground transition-colors duration-200 hover:bg-red-500/20 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:bg-white/10"
      >
        <X className="size-3" />
      </button>

      <div className="flex items-center gap-2 pr-4">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `${entry.subcategoryColor}33`,
            color: entry.subcategoryColor,
          }}
        >
          <DynamicIcon name={entry.subcategoryIcon} className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {entry.subcategoryName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{entry.categoryName}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {formatTimeRange(entry.startedAtMs, entry.endedAtMs)}
      </p>

      <p className="text-sm text-foreground">{formatDuration(entry.actualMinutes)}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            isCompleted
              ? "bg-green-500/15 text-green-700 dark:text-green-400"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
          )}
        >
          {isCompleted ? "Completada" : "Interrumpida"}
        </span>
        {entry.extendedCount > 0 && (
          <span
            className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground"
            title={`Se extendió ${entry.extendedCount} ${entry.extendedCount === 1 ? "vez" : "veces"}`}
          >
            {isCompleted
              ? `Extendida: +${formatDuration(entry.extendedMinutes)}`
              : `Extendida antes: +${formatDuration(entry.extendedMinutes)}`}
          </span>
        )}
      </div>

      {!isCompleted && entry.leftoverMinutes > 0 && (
        <p className="text-xs text-muted-foreground">Sobraron {formatDuration(entry.leftoverMinutes)}</p>
      )}
    </div>
  );
}
