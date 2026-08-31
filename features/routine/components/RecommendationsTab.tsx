"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BatteryFull, BatteryLow, BatteryMedium, ChevronDown, Sparkles, Trash2 } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import { TimeChipList, type TimeChip, type FixedRole } from "@/features/routine/components/TimeChipList";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import { ENERGY_COLORS, COMPLEXITY_LABELS, effectiveComplexityTargets, effectiveRecommendedDuration, effectiveEnergyMin, effectiveEnergyMax, type EnergyLevel } from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";
import type { RoutineCategory } from "@/features/routine/components/RoutineTabs";

const COMPLEXITY_LEVELS: Complexity[] = ["LOW", "MEDIUM", "HIGH"];
const ENERGY_NAMES = { baja: "Baja", media: "Media", alta: "Alta" } as const;
const ENERGY_OPTIONS = [
  { level: "baja" as const, icon: BatteryLow },
  { level: "media" as const, icon: BatteryMedium },
  { level: "alta" as const, icon: BatteryFull },
];

// Dificultad por defecto según energía (auto-selección para reducir fricción)
const ENERGY_DEFAULT_COMPLEXITY: Record<EnergyLevel, Complexity> = {
  baja: "LOW",
  media: "MEDIUM",
  alta: "HIGH",
};

export function RecommendationsTab({
  categories,
  itemsByCategory,
}: {
  categories: RoutineCategory[];
  itemsByCategory: Record<string, SubcategoryItem[]>;
}) {
  const prefs = useRecommendationPrefs();
  const [energy, setEnergy] = useState<EnergyLevel>("media");
  const [difficulty, setDifficulty] = useState<Complexity>("MEDIUM");
  const [openCatId, setOpenCatId] = useState<string | null>(null);

  const comboKey = `${energy}:${difficulty}`;
  const targets = effectiveComplexityTargets(energy, prefs);

  const combo = prefs.recommendationCombos[comboKey];
  const comboSubIds = combo?.subcategoryIds ?? [];
  const comboMin = combo?.min ?? effectiveEnergyMin(energy, prefs);
  const comboRec = combo?.rec ?? effectiveRecommendedDuration(energy, prefs);
  const comboMax = combo?.max ?? effectiveEnergyMax(energy, prefs);
  const comboCustomTimes = combo?.customTimes ?? [];

  // Build chips guaranteeing unique values (required as React key and for
  // value-based edits). Roles are added first; any custom time (or duplicate
  // role) that repeats a value gets dropped.
  const baseChips: TimeChip[] = [
    { value: Math.min(comboMin, comboRec), role: "min", custom: false },
    { value: comboRec, role: "rec", custom: false },
    { value: Math.max(comboMax, comboRec), role: "max", custom: false },
    ...comboCustomTimes.map(
      (v): TimeChip => ({
        value: v,
        role: null,
        custom: true,
        previousRole: combo?.exRoles?.[String(v)] ?? null,
      }),
    ),
  ];
  const seenValues = new Set<number>();
  const timeChips: TimeChip[] = baseChips.filter((c) => {
    if (seenValues.has(c.value)) return false;
    seenValues.add(c.value);
    return true;
  });

  function handleEnergyChange(next: EnergyLevel) {
    setEnergy(next);
    setDifficulty(ENERGY_DEFAULT_COMPLEXITY[next]);
  }

  const activeCombos = Object.entries(prefs.recommendationCombos)
    .filter(([, c]) => c.subcategoryIds.length > 0);

  function persistCombo(
    subIds: string[],
    min: number,
    rec: number,
    max: number,
    customTimes: number[],
    exRoles?: Record<string, FixedRole>,
  ) {
    prefs.setRecommendationCombo(comboKey, {
      subcategoryIds: subIds,
      min,
      rec,
      max,
      customTimes,
      exRoles,
    });
  }

  function toggleSubInCombo(subId: string) {
    const next = comboSubIds.includes(subId)
      ? comboSubIds.filter((id) => id !== subId)
      : [...comboSubIds, subId];
    persistCombo(next, comboMin, comboRec, comboMax, comboCustomTimes, combo?.exRoles);
  }

  function updateComboTimes(chips: TimeChip[]) {
    const rec = chips.find((c) => c.role === "rec");
    const min = chips.find((c) => c.role === "min");
    const max = chips.find((c) => c.role === "max");
    const customChips = chips.filter((c) => c.role === null);
    const custom = customChips.map((c) => c.value).sort((a, b) => a - b);
    const exRoles: Record<string, FixedRole> = {};
    for (const c of customChips) {
      if (c.previousRole) {
        exRoles[String(c.value)] = c.previousRole;
      }
    }
    persistCombo(
      comboSubIds,
      min?.value ?? effectiveEnergyMin(energy, prefs),
      rec?.value ?? effectiveRecommendedDuration(energy, prefs),
      max?.value ?? effectiveEnergyMax(energy, prefs),
      custom,
      exRoles,
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground py-4">Personaliza tus recomendaciones, a tu gusto</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Define tus niveles de dificultad y energeria para las recomendaciones de tus actividades de forma más personalizadas. Cuanto más
          lo ajustes, más acertadas serán las recomendaciones.
        </p>
      </div>

      {/* Energy selector */}
      <div>
        <p className="mb-4 text-sm font-medium text-foreground">Elige el nivel de energía</p>
        <div className="grid grid-cols-3 gap-2">
          {ENERGY_OPTIONS.map(({ level, icon: Icon }) => {
            const active = energy === level;
            const color = ENERGY_COLORS[level];
            return (
              <button key={level} type="button" onClick={() => handleEnergyChange(level)} aria-pressed={active}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 bg-surface px-3 py-2 text-sm font-semibold capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                  active ? "shadow-sm" : "border-border text-foreground hover:bg-surface-hover",
                )}
                style={active ? { borderColor: `${color}55`, color } : undefined}>
                <Icon className="size-5" style={{ color: active ? color : "var(--color-muted-foreground)" }} />
                {ENERGY_NAMES[level]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty selector */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          Define la dificultad de tus actividades
        </p>
        <div className="grid grid-cols-3 gap-2">
          {COMPLEXITY_LEVELS.map((c) => {
            const active = difficulty === c;
            return (
              <button key={c} type="button" onClick={() => setDifficulty(c)} aria-pressed={active}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                  active ? "border-accent-aprender/40 bg-accent-aprender/15 text-accent-aprender" : "border-border bg-surface text-foreground hover:bg-surface-hover",
                )}>
                {COMPLEXITY_LABELS[c]}
              </button>
            );
          })}
        </div>
      </div>
      {/* Time config */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-foreground">
          Escoge tus tiempos para: Energía {ENERGY_NAMES[energy].toLowerCase()}  + Dificultad {COMPLEXITY_LABELS[difficulty].toLowerCase()}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground mb-2">
          Ajusta el tiempo mínimo, recomendado y máximo para esta combinación. También puedes agregar
          tiempos personalizados. El recomendado es el que verás por defecto.
        </p>
        <TimeChipList chips={timeChips} onChange={updateComboTimes} />
      </div>

      {/* Categories + Activities accordion */}
      <div>
        <p className="mb-4 ms-2 text-md font-medium text-foreground">
          ¿Qué actividades quieres recomendar para estos niveles?
        </p>
        <p className="mb-6 ms-2 text-sm leading-relaxed text-muted-foreground text-start">
          Abre una categoría y marca las actividades que quieras que aparezcan cuando tengas{" "}
          {ENERGY_NAMES[energy].toLowerCase()} energía y busques algo {COMPLEXITY_LABELS[difficulty].toLowerCase()}.
        </p>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay categorías aún.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const subs = itemsByCategory[cat.id] ?? [];
              const matching = subs.filter((s) => targets.includes(s.complexity));
              const isOpen = openCatId === cat.id;
              const selectedCount = matching.filter((s) => comboSubIds.includes(s.id)).length;
              return (
                <div key={cat.id} className="overflow-hidden rounded-2xl border border-border bg-surface-muted">
                  <button
                    type="button"
                    onClick={() => setOpenCatId(isOpen ? null : cat.id)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${cat.color}22` }}>
                      <DynamicIcon name={cat.icon} className="size-4" style={{ color: cat.color }} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{cat.name}</span>
                    <span className="shrink-0 rounded-full bg-surface-hover px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                      {selectedCount > 0 ? `${selectedCount}/${matching.length}` : `${matching.length}`}
                    </span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-muted-foreground">
                      <ChevronDown className="size-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-3">
                          {matching.length === 0 ? (
                            <p className="py-2 text-xs text-muted-foreground">
                              Esta categoría no tiene actividades con dificultad {COMPLEXITY_LABELS[difficulty].toLowerCase()}.
                            </p>
                          ) : (
                                            matching.map((sub) => {
                                              const included = comboSubIds.includes(sub.id);
                                              return (
                                                <button
                                                  key={sub.id} type="button"
                                                  onClick={() => toggleSubInCombo(sub.id)} aria-pressed={included}
                                                  className={cn(
                                                    "flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                                                    included
                                                      ? "border-accent-aprender/60 bg-accent-aprender/8 text-accent-aprender shadow-sm"
                                                      : "border-border bg-surface text-foreground hover:bg-surface-hover",
                                                  )}>
                                                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${sub.color}33` }}>
                                                    <DynamicIcon name={sub.icon} className="size-3.5" style={{ color: sub.color }} />
                                                  </span>
                                                  {sub.name}
                                                </button>
                                              );
                                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active combos */}
      {activeCombos.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            <Sparkles className="mr-1 inline size-3.5 text-accent-aprender" />
            Combinaciones configuradas
          </h3>
          <div className="flex flex-col gap-2">
            {activeCombos.map(([key, c]) => {
              const [e, d] = key.split(":") as [EnergyLevel, Complexity];
              return (
                <div key={key} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
                  <span className="text-xs font-semibold capitalize" style={{ color: ENERGY_COLORS[e] }}>{ENERGY_NAMES[e]}</span>
                  <span className="text-xs text-muted-foreground">+</span>
                  <span className="text-xs font-medium text-foreground">{COMPLEXITY_LABELS[d]}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.subcategoryIds.length} act · {c.min}–{c.max} min
                  </span>
                  <button type="button" onClick={() => prefs.removeRecommendationCombo(key)}
                    className="ml-auto cursor-pointer text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
