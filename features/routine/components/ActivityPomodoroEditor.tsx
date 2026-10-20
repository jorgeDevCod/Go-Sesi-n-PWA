"use client";

import { useState, useTransition } from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { PomodoroConfigurator } from "@/features/session/components/PomodoroConfigurator";
import { setActivityPomodoroAction } from "@/features/categories/actions/subcategory.actions";
import { parsePomodoroConfig } from "@/services/session/pomodoro";
import { POMODORO_TIER_BY_ENERGY, pomodoroPresetFor, type PomodoroConfig } from "@/services/session/pomodoro";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import { cn } from "@/lib/utils";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";

/**
 * Cronómetro pomodoro por actividad: el que definas aquí será el que se
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
  const saved = selected ? parsePomodoroConfig(selected.pomodoroConfig) : null;
  const [draft, setDraft] = useState<PomodoroConfig | null>(saved);

  if (!selected) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
        Crea una actividad en {categoryName} para darle su propio cronómetro Pomodoro.
      </p>
    );
  }

  const current = draft ?? saved ?? pomodoroPresetFor(POMODORO_TIER_BY_ENERGY.media, prefs.pomodoroPresets);

  function handleSelect(id: string) {
    const item = items.find((i) => i.id === id);
    setSelectedId(id);
    setDraft(item ? parsePomodoroConfig(item.pomodoroConfig) : null);
    setMessage(null);
  }

  function handleSave() {
    if (!selected) return;
    startTransition(async () => {
      const result = await setActivityPomodoroAction({
        id: selected.id,
        pomodoroConfig: current,
      });
      if (!result.success) {
        setMessage(result.error);
        return;
      }
      setMessage(`Cronómetro guardado para ${selected.name}.`);
    });
  }

  function handleRemove() {
    if (!selected) return;
    startTransition(async () => {
      const result = await setActivityPomodoroAction({ id: selected.id, pomodoroConfig: null });
      if (!result.success) {
        setMessage(result.error);
        return;
      }
      setDraft(null);
      setMessage(`Quitamos el cronómetro propio de ${selected.name}.`);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">Pomodoro de una actividad</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Elige una actividad y define su cronómetro: será el que se ofrezca por defecto al
          iniciarla en modo Pomodoro.
        </p>
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
                "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                active
                  ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              <DynamicIcon
                name={item.icon}
                className="size-3.5"
                style={{ color: item.color }}
              />
              {item.name}
            </button>
          );
        })}
      </div>

      <PomodoroConfigurator
        config={current}
        onChange={(next) => setDraft(next)}
        showReset={Boolean(saved)}
        resetLabel="Quitar el cronómetro propio"
        onReset={handleRemove}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button onClick={handleSave} disabled={isPending} className="sm:w-auto">
          {isPending ? "Guardando..." : "Guardar cronómetro de la actividad"}
        </Button>
        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
