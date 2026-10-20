"use client";

import { useState, useTransition } from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { PomodoroCompactEditor } from "@/features/routine/components/PomodoroCompactEditor";
import { setActivityPomodoroAction } from "@/features/categories/actions/subcategory.actions";
import { parsePomodoroConfig } from "@/services/session/pomodoro";
import {
  POMODORO_TIER_BY_ENERGY,
  POMODORO_TIER_LABELS,
  pomodoroPresetFor,
  type PomodoroConfig,
} from "@/services/session/pomodoro";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import { cn } from "@/lib/utils";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";

/**
 * Cronómetro pomodoro de una actividad: el que definas aquí será el que se
 * ofrezca por defecto al iniciar esa actividad en modo Pomodoro.
 */
export function ActivityPomodoroEditor({
  items,
  categoryName,
}: {
  items: SubcategoryItem[];
  categoryName: string;
}) {
  const prefs = useRecommendationPrefs();
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  if (!selected) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
        Crea una actividad en {categoryName} para darle su propio cronómetro Pomodoro.
      </p>
    );
  }

  const saved = parsePomodoroConfig(selected.pomodoroConfig);
  const tier = POMODORO_TIER_BY_ENERGY[selected.energyLevel ?? "media"];
  const tierConfig = pomodoroPresetFor(tier, prefs.pomodoroPresets);
  const current: PomodoroConfig = saved ?? tierConfig;

  function handleSelect(id: string) {
    setSelectedId(id);
    setMessage(null);
  }

  function handleSave(next: PomodoroConfig) {
    if (!selected) return;
    startTransition(async () => {
      const result = await setActivityPomodoroAction({
        id: selected.id,
        pomodoroConfig: next,
      });
      setMessage(
        result.success
          ? `Cronómetro de ${selected.name} guardado.`
          : (result.error ?? "No se pudo guardar."),
      );
    });
  }

  function handleRemove() {
    if (!selected) return;
    startTransition(async () => {
      const result = await setActivityPomodoroAction({ id: selected.id, pomodoroConfig: null });
      setMessage(
        result.success
          ? `Quitamos el cronómetro de ${selected.name}.`
          : (result.error ?? "No se pudo quitar."),
      );
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Pomodoro por actividad</p>
        {saved && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="cursor-pointer text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:opacity-50"
          >
            Quitar el propio
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = item.id === selected.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-pressed={active}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                active
                  ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              <DynamicIcon name={item.icon} className="size-3" style={{ color: item.color }} />
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface-muted p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {selected.name}
          </p>
          {!saved && (
            <button
              type="button"
              onClick={() => handleSave(tierConfig)}
              className="cursor-pointer text-xs font-medium text-accent-aprender underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              Usar el nivel {POMODORO_TIER_LABELS[tier].toLowerCase()}
            </button>
          )}
        </div>
        <PomodoroCompactEditor
          config={current}
          onChange={handleSave}
        />
      </div>

      {message && (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
