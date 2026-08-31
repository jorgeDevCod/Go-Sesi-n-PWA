"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BatteryFull, BatteryLow, BatteryMedium, Check, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useRecommendationPrefs, recommendationOverridesFromPrefs } from "@/features/recommendation/store/recommendation.store";
import {
  ENERGY_LABELS,
  ENERGY_COLORS,
  ENERGY_ACTIVITY_DESCRIPTIONS,
  effectiveRecommendedDuration,
  effectiveDurationOptions,
  energyDurationHint,
  energyMessage,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";
import { markMoodAnsweredToday } from "@/features/recommendation/mood.storage";

const ENERGY_OPTIONS: { level: EnergyLevel; icon: typeof BatteryLow }[] = [
  { level: "baja", icon: BatteryLow },
  { level: "media", icon: BatteryMedium },
  { level: "alta", icon: BatteryFull },
];

function subscribeNoop() {
  return () => {};
}

type Step = "energy" | "time" | "loading";

const ENERGY_NAMES: Record<EnergyLevel, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export function EnergySurvey({ onComplete }: { onComplete: (energy: EnergyLevel, minutes: number) => void }) {
  const prefs = useRecommendationPrefs();
  const overrides = recommendationOverridesFromPrefs(prefs);
  const recommendedFor = (next: EnergyLevel) => effectiveRecommendedDuration(next, overrides);

  const [step, setStep] = useState<Step>("energy");
  const [energy, setEnergy] = useState<EnergyLevel>("media");
  const [minutes, setMinutes] = useState<number | null>(recommendedFor("media"));
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(15);
  const [parseError, setParseError] = useState<string | null>(null);
  const [show, setShow] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const canShow = isClient && show && typeof document !== "undefined";

  function handleSelectEnergy(next: EnergyLevel) {
    setEnergy(next);
    setMinutes(recommendedFor(next));
    setCustomHours(0);
    setCustomMinutes(15);
    setParseError(null);
  }

  function handleSkip() {
    const e = energy;
    const m = minutes ?? recommendedFor(e);
    prefs.setEnergy(e);
    prefs.setPreferredMinutes(m);
    markMoodAnsweredToday();
    setIsClosing(true);
    setTimeout(() => {
      setShow(false);
      onComplete(e, m);
    }, 200);
  }

  function handleDontAskAgain() {
    prefs.setDontAskAgain(true);
    handleSkip();
  }

  function handleComplete() {
    const e = energy;
    const m = minutes ?? recommendedFor(e);
    setStep("loading");
    setTimeout(() => {
      prefs.setEnergy(e);
      prefs.setPreferredMinutes(m);
      markMoodAnsweredToday();
      setIsClosing(true);
      setTimeout(() => {
        setShow(false);
        onComplete(e, m);
      }, 200);
    }, 600);
  }

  useEffect(() => {
    if (!canShow) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [canShow]);

  const stepKey = step === "loading" ? "loading" : step === "energy" ? "energy" : "time";
  const stepIndex = step === "energy" ? 1 : 2;
  const color = ENERGY_COLORS[energy];

  if (!canShow) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Encuesta de energía"
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{
          opacity: isClosing ? 0 : 1,
          scale: isClosing ? 0.92 : 1,
          y: isClosing ? 16 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <span
            className="flex size-11 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `${color}1f`,
              color,
            }}
          >
            {(() => {
              const Icon = ENERGY_OPTIONS.find((o) => o.level === energy)!.icon;
              return <Icon className="size-5" />;
            })()}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Paso {stepIndex} de 2
            </span>
            <div className="flex gap-1">
              <span
                className={cn(
                  "h-1.5 w-8 rounded-full transition-colors duration-300",
                  step === "energy" ? "bg-accent-aprender" : "bg-surface-hover",
                )}
              />
              <span
                className={cn(
                  "h-1.5 w-8 rounded-full transition-colors duration-300",
                  step === "time" || step === "loading" ? "bg-accent-aprender" : "bg-surface-hover",
                )}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {stepKey === "energy" && (
            <motion.div
              key="energy"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-semibold text-foreground">
                  ¿Cómo está tu energía hoy?
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Con tu nivel de energía elijo qué actividades y tiempos encajan mejor.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {ENERGY_OPTIONS.map(({ level, icon: Icon }) => {
                  const isSelected = energy === level;
                  const isRecommended = level === "media";
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleSelectEnergy(level)}
                      aria-pressed={isSelected}
                      style={{
                        borderColor: isSelected ? ENERGY_COLORS[level] : undefined,
                        backgroundColor: isSelected ? `${ENERGY_COLORS[level]}14` : undefined,
                        boxShadow: isSelected ? `0 8px 18px -6px ${ENERGY_COLORS[level]}55` : undefined,
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                        !isSelected && "border-border bg-surface hover:bg-surface-hover",
                      )}
                    >
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200"
                        style={{
                          backgroundColor: isSelected ? ENERGY_COLORS[level] : `${ENERGY_COLORS[level]}1f`,
                          color: isSelected ? "#ffffff" : ENERGY_COLORS[level],
                        }}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {ENERGY_NAMES[level]}
                          </span>
                          {isRecommended && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                              <Sparkles className="size-3" />
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ENERGY_LABELS[level]} · {ENERGY_ACTIVITY_DESCRIPTIONS[level]}
                        </p>
                        <p className="mt-0.5 text-xs font-medium" style={{ color: ENERGY_COLORS[level] }}>
                          {recommendedFor(level)} min sugeridos
                        </p>
                      </div>
                      {isSelected && (
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                          style={{ backgroundColor: ENERGY_COLORS[level] }}
                        >
                          <Check className="size-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4">
                <Button onClick={() => setStep("time")} className="w-full">
                  Siguiente
                  <ChevronRight className="size-4" />
                </Button>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="cursor-pointer text-muted-foreground underline hover:text-foreground"
                  >
                    Saltar
                  </button>
                  <span className="text-muted-foreground">·</span>
                  <button
                    type="button"
                    onClick={handleDontAskAgain}
                    className="cursor-pointer text-muted-foreground underline hover:text-foreground"
                  >
                    No volver a preguntar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {stepKey === "time" && energy && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-semibold text-foreground">
                  ¿Cuánto tiempo tienes disponible?
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{energyMessage(energy)}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {effectiveDurationOptions(energy, overrides).map((chip) => {
                  const isRecommended = chip === recommendedFor(energy);
                  const isSelected = minutes === chip;
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setMinutes(chip);
                        setCustomHours(0);
                        setCustomMinutes(15);
                        setParseError(null);
                      }}
                      style={
                        isSelected
                          ? { backgroundColor: color, boxShadow: `0 6px 14px -4px ${color}66` }
                          : isRecommended
                            ? { backgroundColor: `${color}14`, borderColor: `${color}66` }
                            : undefined
                      }
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border-2 px-2 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                        isSelected
                          ? "border-transparent text-white"
                          : isRecommended
                            ? "border-transparent text-foreground hover:bg-surface-hover"
                            : "border-border bg-surface text-foreground hover:bg-surface-hover",
                      )}
                    >
                      <span className="text-base font-bold leading-tight">{chip}</span>
                      <span className="text-[11px] font-medium opacity-80">min</span>
                      {isRecommended && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none",
                            isSelected ? "bg-white/25 text-white" : "",
                          )}
                          style={!isSelected ? { backgroundColor: `${color}26`, color } : undefined}
                        >
                          rec.
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
                {energyDurationHint(energy, overrides)}. Ya tienes preseleccionado{" "}
                <span className="font-semibold text-foreground">{recommendedFor(energy)} min</span>{" "}
               -cámbialo si lo necesitas.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={customHours}
                  onChange={(e) => { setCustomHours(Number(e.target.value)); setParseError(null); }}
                  aria-label="Horas"
                  className="h-11 cursor-pointer rounded-xl border border-border bg-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                >
                  {[0, 1, 2, 3, 4].map((h) => (
                    <option key={h} value={h}>{h} h</option>
                  ))}
                </select>
                <select
                  value={customMinutes}
                  onChange={(e) => { setCustomMinutes(Number(e.target.value)); setParseError(null); }}
                  aria-label="Minutos"
                  className="h-11 cursor-pointer rounded-xl border border-border bg-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const parsed = customHours * 60 + customMinutes;
                    if (parsed < 1) {
                      setParseError("Elige un tiempo mayor a 0.");
                      return;
                    }
                    setMinutes(parsed);
                    setParseError(null);
                  }}
                  disabled={customHours * 60 + customMinutes < 1}
                >
                  Usar
                </Button>
              </div>

              {parseError && (
                <p className="text-sm text-red-500">{parseError}</p>
              )}

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => setStep("energy")}>
                    ← Atrás
                  </Button>
                  <Button onClick={handleComplete}>
                    Ver recomendación
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="cursor-pointer self-center text-sm text-muted-foreground underline hover:text-foreground"
                >
                  Saltar
                </button>
              </div>
            </motion.div>
          )}

          {stepKey === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4 py-10"
            >
              <span
                className="flex size-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${color}1f`, color }}
              >
                <Loader2 className="size-7 animate-spin" />
              </span>
              <p className="text-sm text-muted-foreground">Buscando la mejor recomendación...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
