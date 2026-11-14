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
import { todayKey } from "@/lib/day";
import { ROUTES } from "@/lib/routes";

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

export function useOnboardingMachine() {
  const router = useRouter();
  const [machine, setMachine] = useState<OnboardingState>(() =>
    hasWelcomeGuard() ? ONBOARDING_INITIAL : { step: "done" },
  );
  const machineRef = useRef(machine);

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
            router.push(ROUTES.customize);
            break;
          case "go-recommend":
            router.push(ROUTES.recommend);
            break;
          case "go-home":
            router.push(ROUTES.home);
            break;
        }
      }
    },
    [closeWelcome, router],
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

  const dismissToday = useCallback(() => {
    try {
      window.localStorage.setItem(getWelcomeKey(), "1");
    } catch {
      // Storage unavailable.
    }
  }, []);

  return {
    showWelcome: machine.step === "welcome",
    choosePersonalize: () => send({ type: "PERSONALIZE" }),
    choosePlan: () => send({ type: "PLAN" }),
    chooseRecommend: () => send({ type: "RECOMMEND" }),
    chooseStart: () => send({ type: "START" }),
    dismissToday,
  };
}
