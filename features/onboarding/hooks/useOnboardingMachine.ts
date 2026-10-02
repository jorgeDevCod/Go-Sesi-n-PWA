"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  nextOnboardingState,
  ONBOARDING_INITIAL,
  type OnboardingEffect,
  type OnboardingEvent,
  type OnboardingState,
} from "@/features/onboarding/machine";
import { useOnboardingStore } from "@/features/onboarding/store/onboarding.store";
import { usePlanningStore } from "@/features/planning/store/planning.store";
import {
  getTodayPlanAction,
  saveTodayPlanAction,
} from "@/features/planning/actions/planning.actions";
import { hasAnsweredMoodToday } from "@/features/recommendation/mood.storage";
import { todayKey } from "@/lib/day";

const GUIDE_STORAGE_KEY = "gosession-guide-seen";
const WELCOME_STORAGE_PREFIX = "gosession-welcome-seen";

function getWelcomeKey() {
  return `${WELCOME_STORAGE_PREFIX}-${todayKey()}`;
}

function hasWelcomeGuard(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(getWelcomeKey()) !== "1";
  } catch {
    return true;
  }
}

/**
 * Orquestador único del onboarding (5B). La máquina decide el orden;
 * aquí solo se ejecutan efectos. Mismo comportamiento que el cableado
 * disperso anterior, con una diferencia menor: en "conocer" la bienvenida
 * se cierra al resolver el plan (sin parpadeo intermedio).
 */
export function useOnboardingMachine() {
  const router = useRouter();
  const [machine, setMachine] = useState<OnboardingState>(() =>
    hasWelcomeGuard() ? ONBOARDING_INITIAL : { step: "done", afterGuide: "none" },
  );
  const machineRef = useRef(machine);
  const storeMoodOpen = useOnboardingStore((state) => state.moodOpen);
  const setStoreMoodOpen = useOnboardingStore((state) => state.setMoodOpen);

  const closeWelcome = useCallback(() => {
    try {
      window.localStorage.setItem(getWelcomeKey(), "1");
    } catch {
      // Storage unavailable.
    }
    useOnboardingStore.getState().setWelcomeDone(true);
  }, []);

  const runEffects = useCallback(
    async (effects: OnboardingEffect[]) => {
      for (const fx of effects) {
        switch (fx) {
          case "close-welcome":
            closeWelcome();
            break;
          case "open-planning":
            usePlanningStore.getState().open();
            break;
          case "go-routine":
            router.push("/app/routine");
            break;
          case "clear-plan":
            await saveTodayPlanAction([]);
            break;
          case "show-categories":
            try {
              sessionStorage.setItem("gosession-show-categories", "1");
            } catch {
              // Storage unavailable.
            }
            usePlanningStore.getState().bumpPlanVersion();
            break;
          case "open-mood":
            setStoreMoodOpen(true);
            break;
          case "expand-categories":
            setStoreMoodOpen(false);
            window.dispatchEvent(new CustomEvent("gosession-expand-categories"));
            break;
          case "mark-guide-seen":
            try {
              window.sessionStorage.setItem(GUIDE_STORAGE_KEY, "1");
            } catch {
              // Storage unavailable.
            }
            break;
          case "go-home":
            router.push("/app/home");
            break;
        }
      }
    },
    [closeWelcome, router, setStoreMoodOpen],
  );

  const send = useCallback(
    (event: OnboardingEvent) => {
      const result = nextOnboardingState(machineRef.current, event);
      machineRef.current = result.state;
      setMachine(result.state);
      void runEffects(result.effects);
    },
    [runEffects],
  );

  const chooseLearn = useCallback(async () => {
    const result = await getTodayPlanAction();
    send({
      type: "LEARN",
      hasPlan: result.success && !!result.plan && result.plan.items.length > 0,
    });
  }, [send]);

  const closeMood = useCallback(() => {
    // Cierre defensivo: el modal siempre se cierra aunque la máquina ya esté
    // en otro paso (el efecto MOOD_DONE solo expande en paso mood).
    setStoreMoodOpen(false);
    send({ type: "MOOD_DONE" });
  }, [send, setStoreMoodOpen]);

  const dismissToday = useCallback(() => {
    try {
      window.localStorage.setItem(getWelcomeKey(), "1");
    } catch {
      // Storage unavailable.
    }
  }, []);

  return {
    showWelcome: machine.step === "welcome",
    showPlanContinue: machine.step === "plan-continue",
    showMood: storeMoodOpen,
    showGuide: machine.step === "guide",
    choosePersonalize: () => send({ type: "PERSONALIZE" }),
    choosePlan: () => send({ type: "PLAN" }),
    chooseLearn,
    chooseSkip: () => send({ type: "SKIP", needsMood: !hasAnsweredMoodToday() }),
    keepPlan: () => send({ type: "KEEP_PLAN" }),
    startFresh: () => send({ type: "START_FRESH" }),
    closeMood,
    closeGuide: () => send({ type: "GUIDE_DONE" }),
    dismissToday,
  };
}
