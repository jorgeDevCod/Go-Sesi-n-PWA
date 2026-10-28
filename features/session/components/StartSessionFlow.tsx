"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lightbulb, Pencil } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { StartTimeSelector } from "@/features/session/components/StartTimeSelector";
import { TimeConfigModal } from "@/features/session/components/TimeConfigModal";
import { PomodoroConfigModal } from "@/features/session/components/PomodoroConfigModal";
import { CountdownOverlay } from "@/features/session/components/CountdownOverlay";
import { useRegisterAppBack } from "@/components/layout/AppBackContext";
import { startSessionAction } from "@/features/session/actions/session.actions";
import { saveActivityTimerPreferenceAction } from "@/features/categories/actions/subcategory.actions";
import { playSoftStartSound, unlockAudioContext } from "@/features/session/session-sound";
import {
  getStoredCountdownSeconds,
  setStoredCountdownSeconds,
  COUNTDOWN_OPTIONS,
} from "@/features/session/countdown-preference";
import {
  getStoredPomodoroAutoStart,
  setStoredPomodoroAutoStart,
} from "@/features/session/pomodoro-preference";
import {
  getActivityTimerPreference,
  setActivityTimerPreference,
} from "@/features/session/activity-timer-preference";
import {
  POMODORO_TIER_BY_COMPLEXITY,
  POMODORO_TIER_DETAILS,
  POMODORO_TIER_LABELS,
  POMODORO_TIERS,
  describePomodoroPlan,
  pomodoroPlannedMinutes,
  pomodoroPresetFor,
  resolvePomodoroConfigForStart,
  type PomodoroConfig,
} from "@/services/session/pomodoro";
import {
  effectiveDurationOptions,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";
import {
  useRecommendationPrefs,
  recommendationOverridesFromPrefs,
} from "@/features/recommendation/store/recommendation.store";
import { ROUTES } from "@/lib/routes";
import { useAppBack } from "@/lib/use-app-back";
import { cn } from "@/lib/utils";

type SubcategoryOption = { id: string; name: string; icon: string; color: string };
type Step = "duration" | "countdown";
type SessionMode = "CLASSIC" | "POMODORO";

const DURATION_CHIPS = [10, 20, 30, 40, 50, 60];
const SAVE_DEBOUNCE_MS = 700;

function samePlan(a: PomodoroConfig, b: PomodoroConfig) {
  return (
    a.focusMin === b.focusMin &&
    a.breakMin === b.breakMin &&
    a.cycles === b.cycles &&
    (a.longBreakMin ?? 0) === (b.longBreakMin ?? 0) &&
    (a.skipBreaks ?? false) === (b.skipBreaks ?? false)
  );
}

export function StartSessionFlow({
  subcategory,
  categoryName,
  recommendationReason,
  defaultMinutes,
  energy,
  complexity = "MEDIUM",
  activityPomodoroConfig,
  lastClassicMinutes,
  lastMode,
  onBack,
}: {
  subcategory: SubcategoryOption;
  categoryName: string;
  recommendationReason?: string;
  defaultMinutes?: number;
  energy?: EnergyLevel;
  complexity?: Complexity;
  /** Cronómetro pomodoro guardado por el usuario para esta actividad. */
  activityPomodoroConfig?: PomodoroConfig | null;
  /** Último tiempo clásico guardado para esta actividad. */
  lastClassicMinutes?: number | null;
  /** Último modo usado al iniciar esta actividad. */
  lastMode?: SessionMode | null;
  /** Permite volver a la vista interna anterior (p. ej. la lista de recomendaciones). */
  onBack?: () => void;
}) {
  const router = useRouter();
  const appBack = useAppBack();
  useRegisterAppBack(onBack ?? null);
  const prefs = useRecommendationPrefs();
  const overrides = recommendationOverridesFromPrefs(prefs);
  const [step, setStep] = useState<Step>("duration");
  const [autoStart, setAutoStart] = useState(() => getStoredPomodoroAutoStart());
  const effectiveEnergy: EnergyLevel = energy ?? "media";

  const initialPomodoro = activityPomodoroConfig
    ? { ...activityPomodoroConfig, autoStart }
    : {
        ...resolvePomodoroConfigForStart({
          activityConfig: null,
          energy: effectiveEnergy,
          presets: prefs.pomodoroPresets,
          savedCombos: prefs.pomodoroConfigs,
          complexity,
        }),
        autoStart,
      };

  const [mode, setMode] = useState<SessionMode>(
    () => lastMode ?? getActivityTimerPreference(subcategory.id)?.mode ?? "CLASSIC",
  );
  const [classicMinutes, setClassicMinutes] = useState<number | null>(() => {
    const local = getActivityTimerPreference(subcategory.id);
    return lastClassicMinutes ?? local?.classicMinutes ?? defaultMinutes ?? null;
  });
  const [pomodoroConfig, setPomodoroConfig] = useState<PomodoroConfig>(() => {
    if (activityPomodoroConfig) return { ...activityPomodoroConfig, autoStart };
    const local = getActivityTimerPreference(subcategory.id)?.pomodoroConfig;
    if (local) return { ...local, autoStart };
    return initialPomodoro;
  });
  const minutes =
    mode === "CLASSIC"
      ? classicMinutes
      : pomodoroPlannedMinutes(pomodoroConfig);
  const [countdownSeconds, setCountdownSeconds] = useState(() => getStoredCountdownSeconds());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editingMinutes, setEditingMinutes] = useState<number | null>(null);
  const [editingPomodoro, setEditingPomodoro] = useState<PomodoroConfig | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    [],
  );

  const persistPreference = useCallback(
    (
      nextMode: SessionMode,
      nextClassicMinutes: number | null,
      nextConfig: PomodoroConfig | null,
    ) => {
      if (nextMode === "CLASSIC" && typeof nextClassicMinutes !== "number") return;
      if (nextMode === "POMODORO" && !nextConfig) return;

      setActivityTimerPreference(subcategory.id, {
        mode: nextMode,
        ...(typeof nextClassicMinutes === "number"
          ? { classicMinutes: nextClassicMinutes }
          : {}),
        ...(nextConfig ? { pomodoroConfig: nextConfig } : {}),
      });

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void saveActivityTimerPreferenceAction({
          id: subcategory.id,
          mode: nextMode,
          ...(nextMode === "CLASSIC"
            ? { classicMinutes: nextClassicMinutes ?? undefined }
            : { pomodoroConfig: nextConfig ?? undefined }),
        });
      }, SAVE_DEBOUNCE_MS);
    },
    [subcategory.id],
  );

  const baseDurationChips = energy
    ? effectiveDurationOptions(energy, overrides)
    : DURATION_CHIPS;
  const durationChips = [
    ...new Set(
      [
        ...baseDurationChips,
        defaultMinutes,
        lastClassicMinutes,
        classicMinutes,
      ].filter((value): value is number => typeof value === "number"),
    ),
  ].sort((a, b) => a - b);

  const recommendedTier = POMODORO_TIER_BY_COMPLEXITY[complexity];
  const tierConfigs = POMODORO_TIERS.map((key) => ({
    key,
    label: POMODORO_TIER_LABELS[key],
    detail: POMODORO_TIER_DETAILS[key],
    config: pomodoroPresetFor(key, prefs.pomodoroPresets),
  }));

  function handleCountdownChange(seconds: number) {
    setCountdownSeconds(seconds);
    setStoredCountdownSeconds(seconds);
  }

  function handleAutoStartChange(value: boolean) {
    setAutoStart(value);
    setStoredPomodoroAutoStart(value);
  }

  function handleMinutesChange(next: number) {
    setClassicMinutes(next);
    persistPreference("CLASSIC", next, pomodoroConfig);
  }

  function handlePomodoroConfigChange(next: PomodoroConfig) {
    setPomodoroConfig(next);
    if (next.autoStart !== autoStart) handleAutoStartChange(next.autoStart);
    persistPreference("POMODORO", classicMinutes, next);
  }

  function handleModeChange(next: SessionMode) {
    setMode(next);
    setError(null);
    persistPreference(
      next,
      classicMinutes,
      next === "POMODORO" ? { ...pomodoroConfig, autoStart } : pomodoroConfig,
    );
  }

  function startSessionNow() {
    if (!minutes) return;
    if (mode === "POMODORO" && !pomodoroConfig) {
      setError("Elige un programa pomodoro para continuar.");
      setStep("duration");
      return;
    }
    unlockAudioContext();
    playSoftStartSound();
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
    setError(null);
    startTransition(async () => {
      const result = await startSessionAction({
        subcategoryId: subcategory.id,
        plannedMinutes: minutes,
        mode,
        ...(mode === "POMODORO" && pomodoroConfig ? { pomodoroConfig } : {}),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.reused && result.session.subcategoryId !== subcategory.id) {
        setNotice(
          `Ya tienes una sesión activa: ${result.session.subcategoryName}. Continuemos con esa.`,
        );
      }

      router.push(ROUTES.session);
    });
  }

  function handleComenzar() {
    if (countdownSeconds > 0) {
      setStep("countdown");
      return;
    }
    startSessionNow();
  }

  const modeLabel = mode === "CLASSIC" ? "Clásico" : "Pomodoro";
  const countdownLabel = countdownSeconds === 0 ? "Sin cuenta" : `${countdownSeconds} s`;
  const summaryDetail =
    mode === "CLASSIC"
      ? "Enfoque continuo, sin pausas automáticas."
      : `${pomodoroConfig.cycles} ciclos de ${pomodoroConfig.focusMin} min con ${pomodoroConfig.breakMin} min de descanso.`;
  const sessionTip =
    mode === "CLASSIC"
      ? minutes
        ? `Define una meta concreta para estos ${minutes} minutos. Al terminar, anota tu avance.`
        : "Elige un tiempo y define una meta concreta. Al terminar, anota tu avance."
      : "Los descansos también son parte del plan: levántate, respira y vuelve con la misma intención.";

  if (step === "countdown") {
    return <CountdownOverlay seconds={countdownSeconds} onComplete={startSessionNow} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {notice && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-surface-muted p-3 text-center text-sm text-muted-foreground"
        >
          {notice}
        </motion.p>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-aprender">
          Nueva sesión
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Prepara tu sesión
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Elige el ritmo y el tiempo. Tu último ajuste se guarda para esta actividad.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === "duration" && (
          <motion.div
            key="duration"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                  <div
                    className="pointer-events-none absolute -top-12 -right-10 size-36 rounded-full opacity-15"
                    style={{ backgroundColor: subcategory.color }}
                  />
                  <div className="relative flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={onBack ?? appBack}
                      aria-label="Volver"
                      className="mt-0.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `${subcategory.color}33`,
                        color: subcategory.color,
                      }}
                    >
                      <DynamicIcon name={subcategory.icon} className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {categoryName}
                      </p>
                      <h2 className="font-display text-xl font-semibold text-foreground">
                        {subcategory.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {mode === "CLASSIC"
                          ? "Bloque de enfoque continuo"
                          : "Sesión con descansos programados"}
                      </p>
                      {recommendationReason && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {recommendationReason}
                        </p>
                      )}
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground sm:inline">
                      Enfoque
                    </span>
                  </div>
                </div>

                <section className="rounded-3xl border border-border bg-surface p-3 shadow-sm sm:p-4">
                  <div
                    className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-muted p-1"
                    role="group"
                    aria-label="Modo de sesión"
                  >
                    {(["CLASSIC", "POMODORO"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleModeChange(value)}
                        aria-pressed={mode === value}
                        className={cn(
                          "cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                          mode === value
                            ? "bg-surface text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {value === "CLASSIC" ? "Clásico" : "Pomodoro"}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">
                    {mode === "CLASSIC"
                      ? "Un solo bloque de enfoque, ideal para tareas que piden concentración sostenida."
                      : "Alterna foco y descanso para mantener la energía y evitar el agotamiento."}
                  </p>
                </section>

                {mode === "CLASSIC" ? (
                  <section className="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-display text-base font-semibold text-foreground">
                          Duración
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Elige cuánto tiempo quieres enfocarte.
                        </p>
                      </div>
                      {typeof defaultMinutes === "number" && (
                        <span className="rounded-full bg-accent-aprender/10 px-2.5 py-1 text-[10px] font-semibold text-accent-aprender">
                          Sugerido: {defaultMinutes} min
                        </span>
                      )}
                    </div>
                    <StartTimeSelector
                      chips={durationChips}
                      value={classicMinutes}
                      suggestedMinutes={defaultMinutes}
                      onEdit={(next) => setEditingMinutes(next)}
                    />
                  </section>
                ) : (
                  <section className="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                    <div className="mb-3">
                      <h2 className="font-display text-base font-semibold text-foreground">
                        Programa Pomodoro
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Elige un ritmo o ajusta el tuyo.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        {tierConfigs.map((option) => {
                          const selected = samePlan(pomodoroConfig, option.config);
                          const recommended = option.key === recommendedTier;
                          return (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => setEditingPomodoro(option.config)}
                              className={cn(
                                "flex w-full cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                                selected
                                  ? "border-accent-aprender bg-accent-aprender/10 ring-1 ring-accent-aprender"
                                  : recommended
                                    ? "border-accent-aprender/50 bg-surface hover:bg-surface-hover"
                                    : "border-border bg-surface hover:bg-surface-hover",
                              )}
                            >
                              <span className="flex items-center justify-between gap-2">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="text-base font-semibold text-foreground">
                                    {option.label}
                                  </span>
                                  {recommended && (
                                    <span className="rounded-full bg-accent-aprender px-2 py-0.5 text-[10px] font-semibold text-white">
                                      Recomendada
                                    </span>
                                  )}
                                  {selected && (
                                    <span className="rounded-full bg-accent-aprender/15 px-2 py-0.5 text-[10px] font-semibold text-accent-aprender">
                                      En uso
                                    </span>
                                  )}
                                </span>
                                <Pencil className="size-4 shrink-0 text-muted-foreground" />
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                {option.config.focusMin} min foco · {option.config.breakMin} min
                                descanso · {option.config.cycles} ciclos
                              </span>
                              <span className="text-xs text-muted-foreground">{option.detail}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="rounded-2xl border border-border bg-surface-muted p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Tu programación
                          </p>
                          <button
                            type="button"
                            onClick={() => setEditingPomodoro(pomodoroConfig)}
                            className="cursor-pointer text-xs font-medium text-accent-aprender underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                          >
                            Editar
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {describePomodoroPlan(pomodoroConfig)}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="w-full shadow-lg shadow-accent-aprender/15"
                    disabled={mode === "POMODORO" ? !pomodoroConfig : !minutes}
                    onClick={handleComenzar}
                  >
                    {isPending
                      ? "Comenzando..."
                      : mode === "POMODORO" && pomodoroConfig
                        ? `Comenzar · ${pomodoroConfig.cycles} ciclos de ${pomodoroConfig.focusMin} min`
                        : minutes
                          ? `Comenzar · ${minutes} min`
                          : "Comenzar"}
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Podrás pausar o terminar la sesión cuando quieras.
                  </p>
                  {mode === "CLASSIC" && (
                    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Cuenta regresiva
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            Un momento para prepararte antes de empezar.
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                          {countdownLabel}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {COUNTDOWN_OPTIONS.map((seconds) => (
                          <button
                            key={seconds}
                            type="button"
                            onClick={() => handleCountdownChange(seconds)}
                            aria-pressed={countdownSeconds === seconds}
                            className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender ${
                              countdownSeconds === seconds
                                ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                                : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
                            }`}
                          >
                            {seconds === 0 ? "Sin cuenta" : `${seconds}s`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {error && (
                    <p className="text-center text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <aside className="flex flex-col gap-4 self-start md:sticky md:top-24">
                <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
                  <div className="bg-gradient-to-br from-accent-aprender/10 via-transparent to-transparent p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Resumen
                    </p>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="font-display text-4xl font-bold tabular-nums text-foreground">
                        {minutes ?? "—"}
                      </span>
                      <span className="pb-1 text-sm text-muted-foreground">min</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{modeLabel}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {summaryDetail}
                    </p>
                  </div>
                  <dl className="divide-y divide-border border-t border-border px-5 text-xs">
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-muted-foreground">Categoría</dt>
                      <dd className="text-right font-medium text-foreground">{categoryName}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-muted-foreground">Modo</dt>
                      <dd className="text-right font-medium text-foreground">{modeLabel}</dd>
                    </div>
                    {mode === "CLASSIC" && (
                      <div className="flex items-center justify-between gap-3 py-3">
                        <dt className="text-muted-foreground">Cuenta regresiva</dt>
                        <dd className="text-right font-medium text-foreground">{countdownLabel}</dd>
                      </div>
                    )}
                  </dl>
                </section>

                <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-accent-aprender">
                    <Lightbulb className="size-4" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                      Idea para tu sesión
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sessionTip}</p>
                </section>

                <section className="flex items-start gap-3 rounded-3xl border border-border bg-surface-muted p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-accent-aprender shadow-sm">
                    <CheckCircle2 className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ajuste guardado</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Tu último ajuste queda guardado para esta actividad.
                    </p>
                  </div>
                </section>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TimeConfigModal
        open={editingMinutes !== null}
        initialMinutes={editingMinutes ?? classicMinutes ?? defaultMinutes ?? 25}
        onClose={() => setEditingMinutes(null)}
        onApply={(next) => {
          handleMinutesChange(next);
          setEditingMinutes(null);
        }}
      />

      <PomodoroConfigModal
        open={editingPomodoro !== null}
        initialConfig={editingPomodoro ?? pomodoroConfig}
        onClose={() => setEditingPomodoro(null)}
        onApply={(next) => {
          handlePomodoroConfigChange(next);
          setEditingPomodoro(null);
        }}
      />
    </div>
  );
}
