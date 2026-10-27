/**
 * Máquina de estados del onboarding post-login.
 *
 * welcome → (personalizar | planificar | recomendaciones | vamos ya)
 * Si "Vamos Ya" no tiene ánimo respondido, pasa por mood y termina en Home.
 */

export type OnboardingStep = "welcome" | "mood" | "done";

export type OnboardingEvent =
  | { type: "PERSONALIZE" }
  | { type: "PLAN" }
  | { type: "RECOMMEND" }
  | { type: "START"; needsMood: boolean }
  | { type: "MOOD_DONE" };

export type OnboardingEffect =
  | "close-welcome"
  | "open-planning"
  | "go-routine"
  | "go-recommend"
  | "show-categories"
  | "open-mood"
  | "expand-categories"
  | "go-home";

export type OnboardingState = {
  step: OnboardingStep;
};

export const ONBOARDING_INITIAL: OnboardingState = { step: "welcome" };

export function nextOnboardingState(
  state: OnboardingState,
  event: OnboardingEvent,
): { state: OnboardingState; effects: OnboardingEffect[] } {
  switch (state.step) {
    case "welcome":
      switch (event.type) {
        case "PERSONALIZE":
          return { state: { step: "done" }, effects: ["close-welcome", "go-routine"] };
        case "PLAN":
          return { state: { step: "done" }, effects: ["close-welcome", "open-planning"] };
        case "RECOMMEND":
          return { state: { step: "done" }, effects: ["close-welcome", "go-recommend"] };
        case "START":
          return event.needsMood
            ? {
                state: { step: "mood" },
                effects: ["close-welcome", "show-categories", "open-mood"],
              }
            : {
                state: { step: "done" },
                effects: ["close-welcome", "show-categories", "go-home"],
              };
        default:
          return { state, effects: [] };
      }
    case "mood":
      if (event.type === "MOOD_DONE") {
        return { state: { step: "done" }, effects: ["expand-categories", "go-home"] };
      }
      return { state, effects: [] };
    case "done":
      return { state, effects: [] };
  }
}
