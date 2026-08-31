"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BatteryFull, BatteryLow, BatteryMedium, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArrows } from "@/components/ui/ScrollArrows";
import {
  ActivityModal,
  type ActivityModalInitial,
} from "@/features/categories/components/ActivityModal";
import {
  SubcategoryPickerList,
  type PickableSubcategory,
} from "@/features/session/components/SubcategoryPickerList";
import { CategoryAccordionPicker } from "@/features/session/components/CategoryAccordionPicker";
import { StartSessionFlow } from "@/features/session/components/StartSessionFlow";
import { RecommendedActivityCard } from "@/features/session/components/RecommendedActivityCard";
import { EnergySurvey } from "@/features/recommendation/components/EnergySurvey";
import { useRecommendationPrefs, recommendationOverridesFromPrefs } from "@/features/recommendation/store/recommendation.store";
import { getRecommendationsAction } from "@/features/session/actions/recommendation.actions";
import {
  createSubcategoryAction,
  deleteSubcategoryAction,
  updateSubcategoryAction,
} from "@/features/categories/actions/subcategory.actions";
import type { Recommendation } from "@/services/recommendation/recommendation.types";
import type { EnergyLevel } from "@/services/recommendation/energy-level";
import {
  ENERGY_COLORS,
  effectiveRecommendedDuration,
  energyDurationHint,
} from "@/services/recommendation/energy-level";
import { hasAnsweredMoodToday } from "@/features/recommendation/mood.storage";
import type { Complexity } from "@/lib/constants/default-subcategories";
import { cn } from "@/lib/utils";

function subscribeNoop() {
  return () => {};
}

const ENERGY_ICONS: Record<EnergyLevel, typeof BatteryLow> = {
  baja: BatteryLow,
  media: BatteryMedium,
  alta: BatteryFull,
};

const ENERGY_LABEL: Record<EnergyLevel, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

const RECOMMENDATIONS_LIMIT = 6;

export function RecommendationScreen({
  allSubcategories,
  categories,
}: {
  allSubcategories: PickableSubcategory[];
  categories: {
    id: string;
    key: string | null;
    name: string;
    icon: string;
    color: string;
    complexity?: Complexity;
  }[];
}) {
  const router = useRouter();
  const prefs = useRecommendationPrefs();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [forceSurvey, setForceSurvey] = useState(false);
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const autoLoadedRef = useRef(false);
  const [isLoadingRec, startTransition] = useTransition();
  const [subcategories, setSubcategories] = useState(allSubcategories);
  const categoryList = categories;
  const [query, setQuery] = useState("");
  const [browsingAll, setBrowsingAll] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [chosen, setChosen] = useState<PickableSubcategory | null>(null);
  const [chosenMinutes, setChosenMinutes] = useState<number | undefined>(undefined);
  const [chosenReason, setChosenReason] = useState<string | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startDeleteTransition] = useTransition();
  const [modalCreate, setModalCreate] = useState<{
    categoryId: string;
    categoryName: string;
    categoryComplexity?: Complexity;
  } | null>(null);
  const [modalCreateAny, setModalCreateAny] = useState(false);
  const [modalEdit, setModalEdit] = useState<ActivityModalInitial | null>(null);

  const energy = prefs.energy;
  const { energyDurations, energyComplexityTargets, difficultyDurations } = prefs;
  const overrides = useMemo(
    () => ({ energyDurations, energyComplexityTargets, difficultyDurations }),
    [energyDurations, energyComplexityTargets, difficultyDurations],
  );

  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return subcategories.filter((item) => item.name.toLowerCase().includes(trimmed));
  }, [query, subcategories]);

  function loadRecommendations(nextEnergy: EnergyLevel, minutes: number) {
    startTransition(async () => {
      const result = await getRecommendationsAction(
        nextEnergy,
        minutes,
        RECOMMENDATIONS_LIMIT,
        recommendationOverridesFromPrefs(useRecommendationPrefs.getState()),
      );
      if (result.success) {
        setRecommendations(result.recommendations ?? []);
      }
    });
  }

  function handleSurveyComplete(nextEnergy: EnergyLevel, minutes: number) {
    setForceSurvey(false);
    autoLoadedRef.current = true;
    loadRecommendations(nextEnergy, minutes);
  }

  const moodAnsweredToday = isClient && hasAnsweredMoodToday();
  const showSurvey =
    isClient && (forceSurvey || (!prefs.dontAskAgain && !prefs.energy && !moodAnsweredToday));

  useEffect(() => {
    if (autoLoadedRef.current) return;

    let nextEnergy = prefs.energy;
    if (!nextEnergy && moodAnsweredToday) {
      nextEnergy = "media";
    }
    if (!nextEnergy) return;

    autoLoadedRef.current = true;
    const minutes = prefs.preferredMinutes ?? effectiveRecommendedDuration(nextEnergy, overrides);
    startTransition(async () => {
      const result = await getRecommendationsAction(
        nextEnergy,
        minutes,
        RECOMMENDATIONS_LIMIT,
        overrides,
      );
      if (result.success) {
        setRecommendations(result.recommendations ?? []);
      }
    });
  }, [prefs.energy, prefs.preferredMinutes, startTransition, overrides, moodAnsweredToday]);

  function startActivity(item: PickableSubcategory, minutes?: number, reason?: string) {
    setChosen(item);
    setChosenMinutes(
      minutes ?? (energy ? effectiveRecommendedDuration(energy, overrides) : undefined),
    );
    setChosenReason(reason);
  }

  if (showSurvey) {
    return <EnergySurvey onComplete={handleSurveyComplete} />;
  }

  if (chosen) {
    return (
      <motion.div
        key="flow"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <StartSessionFlow
          subcategory={chosen}
          categoryName={chosen.categoryName}
          recommendationReason={chosenReason}
          defaultMinutes={chosenMinutes}
          energy={energy ?? "media"}
        />
      </motion.div>
    );
  }

  function handleEditSubmit(values: {
    name: string;
    icon: string;
    color: string;
    complexity: Complexity;
  }) {
    if (!modalEdit) {
      return Promise.resolve({ success: false, error: "No hay actividad activa." });
    }
    return updateSubcategoryAction({ id: modalEdit.id, ...values }).then((result) => {
      if (result.success) {
        setRecommendations((prev) =>
          prev.map((rec) =>
            rec.subcategoryId === modalEdit.id
              ? {
                  ...rec,
                  subcategoryName: values.name,
                  subcategoryIcon: values.icon,
                  subcategoryColor: values.color,
                  complexity: values.complexity,
                }
              : rec,
          ),
        );
        setSubcategories((prev) =>
          prev.map((item) =>
            item.id === modalEdit.id ? { ...item, ...values } : item,
          ),
        );
        router.refresh();
      }
      return result;
    });
  }

  function handleCreateSubmit(
    values: { name: string; icon: string; color: string; complexity: Complexity },
    meta: { categoryId: string | null },
  ) {
    const categoryId = meta.categoryId;
    if (!categoryId) {
      return Promise.resolve({ success: false, error: "Elige una categoría primero." });
    }
    return createSubcategoryAction({ categoryId, ...values }).then((result) => {
      if (result.success) {
        const category = categoryList.find((c) => c.id === categoryId);
        const newItem: PickableSubcategory = {
          id: result.subcategory.id,
          name: result.subcategory.name,
          icon: result.subcategory.icon,
          color: result.subcategory.color,
          categoryId: result.subcategory.categoryId,
          categoryName: category?.name ?? "",
          complexity: result.subcategory.complexity as Complexity,
        };
        setSubcategories((prev) => [...prev, newItem]);
        router.refresh();
      }
      return result;
    });
  }

  function handleDelete(id: string) {
    const rec = recommendations.find((item) => item.subcategoryId === id);
    const name = rec?.subcategoryName ?? "esta actividad";
    if (typeof window !== "undefined" && !window.confirm(`¿Eliminar "${name}"?`)) {
      return;
    }
    setActionError(null);
    startDeleteTransition(async () => {
      const result = await deleteSubcategoryAction({ id });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setRecommendations((prev) => prev.filter((item) => item.subcategoryId !== id));
      setSubcategories((prev) => prev.filter((item) => item.id !== id));
      router.refresh();
    });
  }

  if (subcategories.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center">
          <p className="text-muted-foreground">
            Todavía no tienes Actividades. Agrega la primera para empezar.
          </p>
        </div>
        <Button onClick={() => setModalCreateAny(true)} className="self-center">
          Crear nueva actividad +
        </Button>

        <ActivityModal
          open={modalCreateAny}
          categories={categoryList}
          onSubmit={handleCreateSubmit}
          onSaved={() => router.refresh()}
          onClose={() => setModalCreateAny(false)}
        />
      </div>
    );
  }

  if (isLoadingRec && recommendations.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4 py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-accent-aprender border-t-transparent" />
        <p className="text-sm text-muted-foreground">Buscando la mejor recomendación...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {energy && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${ENERGY_COLORS[energy]}33` }}
            >
              {(() => {
                const Icon = ENERGY_ICONS[energy];
                return <Icon className="size-5" style={{ color: ENERGY_COLORS[energy] }} />;
              })()}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Energía {ENERGY_LABEL[energy]}
              </p>
              <p className="text-xs text-muted-foreground">
                {energyDurationHint(energy, overrides)} · sugerido{" "}
                {effectiveRecommendedDuration(energy, overrides)} min
              </p>
            </div>
          </div>
          <Button variant="secondary" size="md" onClick={() => setForceSurvey(true)}>
            Cambiar energía
          </Button>
        </div>
      )}

      {recommendations.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent-aprender" />
              <h2 className="text-base font-semibold text-foreground">
                Recomendaciones para tu energía
              </h2>
            </div>
            <ScrollArrows
              containerRef={carouselRef}
              className="hidden min-[600px]:flex"
            />
          </div>
          <div ref={carouselRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto py-4">
            {recommendations.map((rec, index) => (
              <RecommendedActivityCard
                key={rec.subcategoryId}
                recommendation={rec}
                highlighted={index === 0}
                isPending={isPending}
                onStart={() =>
                  startActivity(
                    {
                      id: rec.subcategoryId,
                      name: rec.subcategoryName,
                      icon: rec.subcategoryIcon,
                      color: rec.subcategoryColor,
                      categoryId:
                        subcategories.find((item) => item.id === rec.subcategoryId)
                          ?.categoryId ?? "",
                      categoryName: rec.categoryName,
                      complexity: rec.complexity ?? "MEDIUM",
                    },
                    rec.suggestedMinutes,
                    rec.reason,
                  )
                }
                onEdit={() =>
                  setModalEdit({
                    id: rec.subcategoryId,
                    name: rec.subcategoryName,
                    icon: rec.subcategoryIcon,
                    color: rec.subcategoryColor,
                    complexity: rec.complexity ?? "MEDIUM",
                  })
                }
                onDelete={() => handleDelete(rec.subcategoryId)}
              />
            ))}
          </div>
        </section>
      )}

      {actionError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-500"
          role="alert"
        >
          {actionError}
        </motion.p>
      )}

      <div className="flex flex-col gap-3">
        <label htmlFor="quick-search" className="text-sm text-muted-foreground">
          ¿Tienes algo más en mente? Escríbelo aquí.
        </label>
        <Input
          id="quick-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ej: leer, estirar, revisar el presupuesto..."
        />
      </div>

      <AnimatePresence mode="wait">
        {query.trim() ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {searchResults.length > 0 ? (
              <SubcategoryPickerList
                items={searchResults}
                onSelect={(item) => startActivity(item)}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-4 text-center text-sm text-muted-foreground">
                No encontramos &quot;{query}&quot;.{" "}
                <button
                  type="button"
                  onClick={() => setModalCreateAny(true)}
                  className="cursor-pointer font-medium text-foreground underline"
                >
                  Crear como nueva actividad
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            <button
              type="button"
              onClick={() => setBrowsingAll((value) => !value)}
              title="Elegir qué hacer hoy"
              className={cn(
                "flex cursor-pointer items-center gap-1 self-start text-sm font-medium text-foreground underline",
              )}
            >
              {browsingAll ? "Ocultar todas mis opciones" : "Ver todas las opciones"}
              <ChevronDown
                className={cn("size-4 transition-transform duration-200", browsingAll && "rotate-180")}
              />
            </button>
            {browsingAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex flex-col gap-3"
              >
                <CategoryAccordionPicker
                  categories={categoryList}
                  items={subcategories}
                  onSelect={(item) => startActivity(item)}
                  onCreateActivity={(category) =>
                    setModalCreate({
                      categoryId: category.id,
                      categoryName: category.name,
                      categoryComplexity: category.complexity,
                    })
                  }
                />
                <Button
                  variant="secondary"
                  onClick={() => setModalCreateAny(true)}
                  className="self-start"
                >
                  Crear nueva actividad +
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ActivityModal
        open={modalCreate !== null}
        categoryId={modalCreate?.categoryId}
        categoryName={modalCreate?.categoryName}
        categoryComplexity={modalCreate?.categoryComplexity}
        onSubmit={handleCreateSubmit}
        onSaved={() => router.refresh()}
        onClose={() => setModalCreate(null)}
      />

      <ActivityModal
        open={modalCreateAny}
        categories={categoryList}
        onSubmit={handleCreateSubmit}
        onSaved={() => router.refresh()}
        onClose={() => setModalCreateAny(false)}
      />

      <ActivityModal
        open={modalEdit !== null}
        initial={modalEdit}
        onSubmit={handleEditSubmit}
        onSaved={() => router.refresh()}
        onClose={() => setModalEdit(null)}
      />
    </div>
  );
}
