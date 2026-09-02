"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { DurationPicker } from "@/features/session/components/DurationPicker";
import { ConfirmScreen } from "@/features/session/components/ConfirmScreen";
import { CountdownOverlay } from "@/features/session/components/CountdownOverlay";
import { startSessionAction } from "@/features/session/actions/session.actions";
import { playSoftStartSound, unlockAudioContext } from "@/features/session/session-sound";
import {
  getStoredCountdownSeconds,
  setStoredCountdownSeconds,
} from "@/features/session/countdown-preference";
import {
  ENERGY_ACTIVITY_DESCRIPTIONS,
  effectiveDurationOptions,
  effectiveMaxLabel,
  type EnergyLevel,
} from "@/services/recommendation/energy-level";
import {
  useRecommendationPrefs,
  recommendationOverridesFromPrefs,
} from "@/features/recommendation/store/recommendation.store";

type SubcategoryOption = { id: string; name: string; icon: string; color: string };
type Step = "duration" | "confirm" | "countdown";

const DURATION_CHIPS = [10, 20, 30, 40, 50, 60];

export function StartSessionFlow({
  subcategory,
  categoryName,
  recommendationReason,
  defaultMinutes,
  energy,
}: {
  subcategory: SubcategoryOption;
  categoryName: string;
  recommendationReason?: string;
  defaultMinutes?: number;
  energy?: EnergyLevel;
}) {
  const router = useRouter();
  const prefs = useRecommendationPrefs();
  const overrides = recommendationOverridesFromPrefs(prefs);
  const [step, setStep] = useState<Step>(defaultMinutes ? "confirm" : "duration");
  const [minutes, setMinutes] = useState<number | null>(defaultMinutes ?? null);
  const [countdownSeconds, setCountdownSeconds] = useState(() => getStoredCountdownSeconds());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCountdownChange(seconds: number) {
    setCountdownSeconds(seconds);
    setStoredCountdownSeconds(seconds);
  }

  function startSessionNow() {
    if (!minutes) return;
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
      });

      if (!result.success) {
        setError(result.error);
        setStep("confirm");
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
            <p className="rounded-2xl bg-accent-aprender/5 px-4 py-3 text-sm leading-relaxed text-accent-aprender">
              Elige el tiempo que te funcione hoy. Puedes ajustarlo manualmente si lo necesitas.
            </p>
            <DurationPicker
              chips={energy ? effectiveDurationOptions(energy, overrides) : DURATION_CHIPS}
              suggestedMinutes={defaultMinutes}
              defaultMinutes={defaultMinutes}
              maxLabel={
                energy
                  ? `${effectiveMaxLabel(energy, overrides)}-${ENERGY_ACTIVITY_DESCRIPTIONS[energy]}`
                  : undefined
              }
              onSelect={(value) => {
                setMinutes(value);
                setStep("confirm");
              }}
            />
          </motion.div>
        )}

        {step === "confirm" && minutes && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ConfirmScreen
              subcategoryName={subcategory.name}
              categoryName={categoryName}
              icon={subcategory.icon}
              color={subcategory.color}
              minutes={minutes}
              countdownSeconds={countdownSeconds}
              onCountdownChange={handleCountdownChange}
              onConfirm={handleComenzar}
              onBack={() => setStep("duration")}
              isPending={isPending}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center text-sm text-red-500"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
