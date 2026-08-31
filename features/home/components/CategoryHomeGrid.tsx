"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BatteryFull, BatteryLow, BatteryMedium, ChevronRight, Sparkles } from "lucide-react";
import {
  CategoryHomeCard,
  type CategoryHomeData,
} from "@/features/home/components/CategoryHomeCard";
import {
  CreateCategoryCard,
  type CreatedCategory,
} from "@/features/categories/components/CreateCategoryCard";
import { DismissibleHint } from "@/components/ui/DismissibleHint";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { AddTaskFlow } from "@/features/home/components/AddTaskFlow";
import {
  PlannedCategories,
  type PlannedItem,
  type ActiveSessionInfo,
} from "@/features/home/components/PlannedCategories";
import { HomeQuickSection } from "@/features/home/components/HomeQuickSection";
import { useHomeQuickStore } from "@/features/home/store/home-quick.store";
import { getTodayPlanAction } from "@/features/planning/actions/planning.actions";
import { usePlanningStore } from "@/features/planning/store/planning.store";
import { useRecommendationPrefs } from "@/features/recommendation/store/recommendation.store";
import { sortActivitiesByEnergy } from "@/features/session/sort-activities";
import {
  ENERGY_COLORS,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";

const ENERGY_ICONS: Record<EnergyLevel, typeof BatteryLow> = {
  baja: BatteryLow,
  media: BatteryMedium,
  alta: BatteryFull,
};

export function CategoryHomeGrid({
  initialCategories,
}: {
  initialCategories: CategoryHomeData[];
}) {
  const [categories, setCategories] = useState(initialCategories);

  // Planning state
  const [planItems, setPlanItems] = useState<PlannedItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSessionInfo>(null);
  // Read the one-shot "show categories" flag during init, so we never call
  // setState synchronously inside an effect.
  const [showAllCategories, setShowAllCategories] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return sessionStorage.getItem("gosession-show-categories") === "1" || true;
    } catch {
      return true;
    }
  });
  const categoriesRef = useRef<HTMLButtonElement>(null);

  const planVersion = usePlanningStore((state) => state.planVersion);
  const prefs = useRecommendationPrefs();
  const energy = prefs.energy;

  const sortedCategories = useMemo(
    () => sortActivitiesByEnergy(categories, energy ?? "media"),
    [categories, energy],
  );

  function applyPlanResult(result: Awaited<ReturnType<typeof getTodayPlanAction>>) {
    if (!result.success) return;
    if (result.plan) {
      setPlanItems(
        result.plan.items.map((item) => ({
          id: item.id,
          title: item.title,
          icon: item.icon,
          color: item.color,
          completed: item.completed,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          categoryIcon: item.categoryIcon,
          categoryColor: item.categoryColor,
          subcategoryId: item.subcategoryId,
          practiced: item.practiced,
        })),
      );
    }
    setActiveSession(result.activeSession);
  }

  useEffect(() => {
    void useHomeQuickStore.persist.rehydrate();

    let cancelled = false;

    // Solo cargamos el plan para mostrarlo. El modal de planificación se abre
    // únicamente cuando el usuario lo elige (modal de bienvenida o botón del header).
    getTodayPlanAction().then((result) => {
      if (cancelled) return;
      applyPlanResult(result);
      // Si no hay plan y es la primera carga, marcar como ya expandido.
      if (!result.success || !result.plan || result.plan.items.length === 0) {
        try {
          sessionStorage.setItem("gosession-categories-auto-opened", "1");
        } catch {}
      }
    });

    // Si el flag de "mostrar categorías" está activo, hacer scroll a ellas.
    try {
      if (sessionStorage.getItem("gosession-show-categories") === "1") {
        sessionStorage.removeItem("gosession-show-categories");
        setTimeout(() => {
          categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
      }
    } catch {}

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (planVersion === 0) return;
    let cancelled = false;
    getTodayPlanAction().then((result) => {
      if (cancelled) return;
      applyPlanResult(result);
    });
    // Revisar si el flag de expandir categorías fue activado
    try {
      if (sessionStorage.getItem("gosession-show-categories") === "1") {
        sessionStorage.removeItem("gosession-show-categories");
        setTimeout(() => {
          categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
      }
    } catch {}
    return () => {
      cancelled = true;
    };
  }, [planVersion]);

  // Escucha el evento de expandir categorías post-modal
  useEffect(() => {
    function onExpand() {
      setShowAllCategories(true);
      setTimeout(() => {
        categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
    window.addEventListener("gosession-expand-categories", onExpand);
    return () => window.removeEventListener("gosession-expand-categories", onExpand);
  }, []);

  // Refresca estados de sesión (En curso/En espera/Realizada) al volver a la pestaña.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      getTodayPlanAction().then((result) => {
        if (result.success) {
          applyPlanResult(result);
        }
      });
      // Revisar flag de expandir categorías al volver a la pestaña
      try {
        if (sessionStorage.getItem("gosession-show-categories") === "1") {
          setShowAllCategories(true);
          sessionStorage.removeItem("gosession-show-categories");
          setTimeout(() => {
            categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 400);
        }
      } catch {}
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  function handleCategoryCreated(category: CreatedCategory) {
    const newEntry: CategoryHomeData = {
      ...category,
      isDefault: false,
      subcategoryCount: 0,
    };
    setCategories((prev) => [...prev, newEntry]);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          Tu espacio para avanzar, sin fricción. ⭐
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Elige una categoría para empezar o planifica tus actividades o deja que Go Sesión te recomiende algo.
        </p>
      </div>

      {/* Energy selector */}
      <div className="flex flex-col gap-2">
        <p className="font-display text-sm font-semibold text-foreground">Selecciona tu nivel de energía</p>
        <div className="flex gap-2">
          {(["baja", "media", "alta"] as EnergyLevel[]).map((level) => {
            const active = energy === level;
            const color = ENERGY_COLORS[level];
            const Icon = ENERGY_ICONS[level];
            return (
              <button
                key={level}
                type="button"
                onClick={() => prefs.setEnergy(level)}
                aria-pressed={active}
                className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl border-2 bg-surface px-3 py-2 text-sm font-semibold capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                style={
                  active
                    ? { borderColor: `${color}55`, color }
                    : { borderColor: "var(--color-border)" }
                }
              >
                <Icon className="size-4" style={{ color: active ? color : "var(--color-muted-foreground)" }} />
                {level === "baja" ? "Baja" : level === "media" ? "Media" : "Alta"}
              </button>
            );
          })}
        </div>
      </div>

      <DismissibleHint storageKey="gosession-hint-home-seen">
        Elige qué quieres hacer y comienza. ¿No sabes por dónde empezar? Deja que Go Sesión elija por ti.
      </DismissibleHint>

      {/* "No sé qué hacer" CTA */}
      <motion.a
        href="/app/session/recommend"
        title="¡No sé qué hacer hoy. Recomiéndame Algo!"
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.08 }}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl bg-accent-aprender p-4 text-left text-white shadow-md transition-colors duration-200 hover:bg-accent-aprender-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <span className="flex items-center gap-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-base font-semibold leading-tight">
              ¿No sabes qué hacer hoy? ¡Te recomiendo algo!
            </span>
            <span className="text-sm text-white/80 ps-1">
             Deja que Go encuentre algo para ti
            </span>
          </span>
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <ChevronRight className="size-5" />
        </span>
      </motion.a>

      {/* Categories toggle */}
      <motion.button
        ref={categoriesRef}
        type="button"
        onClick={() => setShowAllCategories((value) => !value)}
        title={
          showAllCategories
            ? "Ocultar las categorías disponibles"
            : "Ver todas las categorías disponibles"
        }
        aria-expanded={showAllCategories}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.08 }}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-border bg-surface p-4 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <span className="flex items-center gap-2">
          <DynamicIcon
            name={showAllCategories ? "ChevronUp" : "LayoutGrid"}
            className="size-4 text-muted-foreground"
          />
          {showAllCategories ? "Ocultar categorías" : "Explorar todas las categorías"}
        </span>
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted-foreground">
          {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
        </span>
      </motion.button>

      <AnimatePresence initial={false}>
        {showAllCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-5 overflow-hidden"
          >
            <div className="flex flex-col gap-1.5">
              <p className="font-display text-base font-semibold text-foreground">Tus categorías</p>
              <p className="text-xs text-muted-foreground">
                Toca una categoría para ver sus actividades y empezar una sesión.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sortedCategories.map((category) => (
                <CategoryHomeCard
                  key={category.id}
                  category={category}
                />
              ))}
              <CreateCategoryCard onCreated={handleCategoryCreated} variant="card" />
            </div>

            <div className="flex flex-col gap-3">
              <AddTaskFlow categories={categories} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todays plan */}
      {planItems.length > 0 && (
        <PlannedCategories
          items={planItems}
          activeSession={activeSession}
          onItemsChange={setPlanItems}
        />
      )}

      {/* Accessos rápidos (actividades marcadas para el home) */}
      <HomeQuickSection />
    </div>
  );
}
