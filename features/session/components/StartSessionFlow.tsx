"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { DurationPicker } from "@/features/session/components/DurationPicker";
import { PomodoroConfigurator } from "@/features/session/components/PomodoroConfigurator";
import { CountdownOverlay } from "@/features/session/components/CountdownOverlay";
import { startSessionAction } from "@/features/session/actions/session.actions";
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
  POMODORO_TIER_DETAILS,
  POMODORO_TIER_LABELS,
  POMODORO_TIERS,
  pomodoroPlannedMinutes,
  pomodoroPresetFor,
  resolvePomodoroConfigForStart,
  type PomodoroConfig,
} from "@/services/session/pomodoro";
import { setActivityPomodoroAction } from "@/features/categories/actions/subcategory.actions";
import {
  effectiveDurationOptions,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";import {
  useRecommendationPrefs,
  recommendationOverridesFromPrefs,
} from "@/features/recommendation/store/recommendation.store";

type SubcategoryOption = { id: string; name: string; icon: string; color: string };
type Step = "duration" | "countdown";
type SessionMode = "CLASSIC" | "POMODORO";

const DURATION_CHIPS = [10, 20, 30, 40, 50, 60];

export function StartSessionFlow({
  subcategory,
  categoryName,
  recommendationReason,
  defaultMinutes,
  energy,
  complexity = "MEDIUM",
  activityPomodoroConfig,
}: {
  subcategory: SubcategoryOption;
  categoryName: string;
  recommendationReason?: string;
  defaultMinutes?: number;
  energy?: EnergyLevel;
  complexity?: Complexity;
  /** Cronómetro guardado por el usuario para esta actividad. */
  activityPomodoroConfig?: PomodoroConfig | null;
}) {
  const router = useRouter();
  const prefs = useRecommendationPrefs();
  const overrides = recommendationOverridesFromPrefs(prefs);
  const [step, setStep] = useState<Step>("duration");
  const [minutes, setMinutes] = useState<number | null>(defaultMinutes ?? null);
  const [mode, setMode] = useState<SessionMode>("CLASSIC");
  const [pomodoroConfig, setPomodoroConfig] = useState<PomodoroConfig | null>(null);
  const [showAdjust, setShowAdjust] = useState(false);
  const [autoStart, setAutoStart] = useState(() => getStoredPomodoroAutoStart());
  const [countdownSeconds, setCountdownSeconds] = useState(() => getStoredCountdownSeconds());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const effectiveEnergy: EnergyLevel = energy ?? "media";
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

  function handlePomodoroConfigChange(next: PomodoroConfig) {
    setPomodoroConfig(next);
    setMinutes(pomodoroPlannedMinutes(next));
    if (next.autoStart !== autoStart) {
      handleAutoStartChange(next.autoStart);
    }
  }

  function handleModeChange(next: SessionMode) {
    setMode(next);
    setError(null);
    if (next === "CLASSIC") {
      setPomodoroConfig(null);
      return;
    }
    // Al entrar en pomodoro: el cronómetro de la actividad si lo guardaste,
    // si no el nivel pre-programado de tu energía.
    const config = resolvePomodoroConfigForStart({
      activityConfig: activityPomodoroConfig ?? null,
      energy: effectiveEnergy,
      presets: prefs.pomodoroPresets,
      savedCombos: prefs.pomodoroConfigs,
      complexity,
    });
    const withAuto = { ...config, autoStart };
    setPomodoroConfig(withAuto);
    setMinutes(pomodoroPlannedMinutes(withAuto));
  }

  function handleSaveAsActivityDefault() {
    if (!pomodoroConfig) return;
    setIsSaving(true);
    startTransition(async () => {
      const result = await setActivityPomodoroAction({
        id: subcategory.id,
        pomodoroConfig,
      });
      setIsSaving(false);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(`Guardamos tu cronómetro como predeterminado de ${subcategory.name}.`);
    });
  }

  function handlePomodoroSelect(option: { key: string; config: PomodoroConfig }) {
    const config = { ...option.config, autoStart };
    setPomodoroConfig(config);
    setMinutes(pomodoroPlannedMinutes(config));
  }

  function startSessionNow() {
    if (!minutes) return;
    if (mode === "POMODORO" && !pomodoroConfig) {
      setError("Elige un programa pomodoro para continuar.");
      setStep("duration");
      return;
    }
    // Desbloquea el audio dentro del gesto del usuario (autoplay policy).
    unlockAudioContext();
    playSoftStartSound();
    // Pedir permiso de notificaciones al iniciar la sesión, para poder avisar
    // al terminar el tiempo o si la app queda en segundo plano.
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

      router.push("/app/session");
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
            {mode === "CLASSIC" ? (
              <div className="flex flex-col gap-3">
                <DurationPicker
                  chips={energy ? effectiveDurationOptions(energy, overrides) : DURATION_CHIPS}
                  suggestedMinutes={defaultMinutes}
                  defaultMinutes={defaultMinutes}
                  onSelect={(value) => setMinutes(value)}
                />
                {energy && (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Tus tiempos:{" "}
                      {effectiveDurationOptions(energy, overrides).join(" · ")} min
                    </span>
                    <Link
                      href="/app/routine?tab=actividades"
                      className="font-medium text-accent-apprendre underline underline-offset-4 hover:text-accent-aprender-hover"
                    >
                      Ajustar en Personalizar
                    </Link>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  {tierConfigs.map((option) => {
                    const selected =
                      pomodoroConfig !== null &&
                      pomodoroConfig.focusMin === option.config.focusMin &&
                      pomodoroConfig.breakMin === option.config.breakMin &&
                      pomodoroConfig.cycles === option.config.cycles;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => handlePomodoroSelect(option)}
                        aria-pressed={selected}
                        className={`cursor-pointer rounded-2xl border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender ${
                          selected
                            ? "border-accent-aprender bg-surface-muted"
                            : "border-border bg-surface hover:bg-surface-hover"
                        }`}
                      >
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.config.focusMin} min foco · {option.config.breakMin} min descanso ·{" "}
                          {option.config.cycles} ciclos ·{" "}
                          {pomodoroPlannedMinutes(option.config)} min en total
                        </p>
                        <p className="text-xs text-muted-foreground">{option.detail}</p>
                      </button>
                    );
                  })}
                </div>

                {pomodoroConfig && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground">
                        {pomodoroConfig.cycles} ciclos · {pomodoroConfig.focusMin} min foco ·{" "}
                        {pomodoroConfig.breakMin} min descanso ·{" "}
                        {pomodoroPlannedMinutes(pomodoroConfig)} min en total
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAdjust((v) => !v)}
                        aria-expanded={showAdjust}
                        className="shrink-0 cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                      >
                        {showAdjust ? "Ocultar ajuste" : "Ajustar"}
                      </button>
                    </div>

                    {showAdjust && (
                      <div className="flex flex-col gap-3">
                        <PomodoroConfigurator
                          config={pomodoroConfig}
                          onChange={handlePomodoroConfigChange}
                          showReset={Boolean(activityPomodoroConfig)}
                          resetLabel="Volver al cronómetro de esta actividad"
                          onReset={() => {
                            if (!activityPomodoroConfig) return;
                            handlePomodoroConfigChange(activityPomodoroConfig);
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSaveAsActivityDefault}
                          disabled={isSaving}
                          className="cursor-pointer self-start rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Guardar como predeterminado de {subcategory.name}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full"
                disabled={
                  mode === "POMODORO" ? !pomodoroConfig : !minutes
                }
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
    </div>
  );
}
