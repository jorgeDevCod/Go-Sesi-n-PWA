"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pencil } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { StartTimeSelector } from "@/features/session/components/StartTimeSelector";
import { TimeConfigModal } from "@/features/session/components/TimeConfigModal";
import { PomodoroConfigModal } from "@/features/session/components/PomodoroConfigModal";
import { CountdownOverlay } from "@/features/session/components/CountdownOverlay";
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
}) {
  const router = useRouter();
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

  if (step === "countdown") {
    return <CountdownOverlay seconds={countdownSeconds} onComplete={startSessionNow} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      {notice && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-surface-muted p-3 text-center text-sm text-muted-foreground"
        >
          {notice}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {step === "duration" && (
          <motion.div
            key="duration"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Volver"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
              </button>
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${subcategory.color}33`, color: subcategory.color }}
              >
                <DynamicIcon name={subcategory.icon} className="size-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">{subcategory.name}</p>
                <p className="text-xs text-muted-foreground">{categoryName}</p>
                {recommendationReason && (
                  <p className="text-sm text-muted-foreground">{recommendationReason}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2" role="group" aria-label="Modo de sesión">
              {(["CLASSIC", "POMODORO"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleModeChange(value)}
                  aria-pressed={mode === value}
                  className={`flex-1 cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender ${
                    mode === value
                      ? "border-accent-aprender bg-surface-muted text-foreground"
                      : "border-border bg-surface text-muted-foreground hover:bg-surface-hover"
                  }`}
                >
                  {value === "CLASSIC" ? "Clásico" : "Pomodoro"}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Tu último ajuste se guarda para esta actividad.
            </p>

            {mode === "CLASSIC" ? (
              <StartTimeSelector
                chips={durationChips}
                value={classicMinutes}
                suggestedMinutes={defaultMinutes}
                onEdit={(next) => setEditingMinutes(next)}
              />
            ) : (
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
                          {option.config.focusMin} min foco · {option.config.breakMin} min descanso ·{" "}
                          {option.config.cycles} ciclos
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
            )}

            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full"
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
              {mode === "CLASSIC" && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>Cuenta regresiva</span>
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
              )}
              {error && (
                <p className="text-center text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
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
