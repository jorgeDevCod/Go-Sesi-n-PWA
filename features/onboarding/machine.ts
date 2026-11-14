/**
 * Máquina de estados del onboarding post-login.
 *
 * welcome → (personalizar | planificar | recomendaciones | vamos ya)
 * El modal de energía se muestra desde Home cuando corresponde.
 */

export type OnboardingStep = "welcome" | "done";

export type OnboardingEvent =
  | { type: "PERSONALIZE" }
  | { type: "PLAN" }
  | { type: "RECOMMEND" }
  | { type: "START" };

export type OnboardingEffect =
  | "close-welcome"
  | "open-planning"
  | "go-routine"
  | "go-recommend"
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
          return { state: { step: "done" }, effects: ["close-welcome", "go-home"] };
        default:
          return { state, effects: [] };
      }
    case "done":
      return { state, effects: [] };
  }
}
