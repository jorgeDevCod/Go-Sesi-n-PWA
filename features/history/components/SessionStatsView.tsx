import type { SessionStats } from "@/features/history/session-stats";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-4">
      <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/** Resumen de estadísticas, server component sin interactividad. */
export function SessionStatsView({ stats }: { stats: SessionStats }) {
  const maxWeek = Math.max(1, ...stats.weeklyMinutes.map((w) => w.minutes));
  const completionRate =
    stats.totalSessions > 0 ? Math.round((stats.completedCount / stats.totalSessions) * 100) : 0;

  return (
    <section aria-label="Estadísticas" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={`${stats.streakDays}`} label={stats.streakDays === 1 ? "día de racha" : "días de racha"} />
        <StatCard value={`${stats.totalSessions}`} label="sesiones" />
        <StatCard value={`${stats.totalMinutes}`} label="minutos" />
        <StatCard value={`${completionRate}%`} label="completadas" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">Minutos por semana</p>
        <div className="flex items-end gap-1.5" role="img" aria-label="Minutos por semana, últimas 8 semanas">
          {stats.weeklyMinutes.map((week) => (
            <div key={week.weekStartMs} title={`${week.label}: ${week.minutes} min`} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-accent-aprender"
                style={{ height: `${Math.max(4, Math.round((week.minutes / maxWeek) * 72))}px`, opacity: week.minutes > 0 ? 1 : 0.25 }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {stats.weeklyMinutes[7]?.label}: {stats.weeklyMinutes[7]?.minutes} min
        </p>
      </div>

      {stats.byCategory.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-medium text-foreground">Por categoría</p>
          {stats.byCategory.map((category) => (
            <div key={category.name} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{category.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {category.sessions} {category.sessions === 1 ? "sesión" : "sesiones"} · {category.minutes} min
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
