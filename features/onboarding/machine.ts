/**
 * Máquina de estados del onboarding post-login (5B).
 *
 * Un solo lugar para el orden welcome → plan-continue → mood → guide → done.
 * Pura y testeable: los efectos de navegación/storage los ejecuta el hook.
 */

export type OnboardingStep = "welcome" | "plan-continue" | "mood" | "guide" | "done";

export type OnboardingEvent =
  | { type: "PERSONALIZE" }
  | { type: "PLAN" }
  | { type: "LEARN"; hasPlan: boolean }
  | { type: "SKIP"; needsMood: boolean }
  | { type: "KEEP_PLAN" }
  | { type: "START_FRESH" }
  | { type: "MOOD_DONE" }
  | { type: "GUIDE_DONE" };

export type OnboardingEffect =
  | "close-welcome"
  | "open-planning"
  | "go-routine"
  | "clear-plan"
  | "show-categories"
  | "open-mood"
  | "expand-categories"
  | "mark-guide-seen"
  | "go-home";

export type OnboardingState = {
  step: OnboardingStep;
  /** Al cerrar la guía, volver al home (viene de "empezar desde cero"). */
  afterGuide: "none" | "home";
};

export const ONBOARDING_INITIAL: OnboardingState = { step: "welcome", afterGuide: "none" };

export function nextOnboardingState(
  state: OnboardingState,
  event: OnboardingEvent,
): { state: OnboardingState; effects: OnboardingEffect[] } {
  switch (state.step) {
    case "welcome":
      switch (event.type) {
        case "PERSONALIZE":
          return { state: { ...state, step: "done" }, effects: ["close-welcome", "go-routine"] };
        case "PLAN":
          return { state: { ...state, step: "done" }, effects: ["close-welcome", "open-planning"] };
        case "LEARN":
          return event.hasPlan
            ? { state: { ...state, step: "plan-continue" }, effects: ["close-welcome"] }
            : { state: { ...state, step: "guide" }, effects: ["close-welcome"] };
        case "SKIP":
          return event.needsMood
            ? {
                state: { ...state, step: "mood" },
                effects: ["close-welcome", "show-categories", "open-mood"],
              }
            : {
                state: { ...state, step: "done" },
                effects: ["close-welcome", "show-categories"],
              };
        default:
          return { state, effects: [] };
      }
    case "plan-continue":
      switch (event.type) {
        case "KEEP_PLAN":
          return { state: { ...state, step: "guide" }, effects: [] };
        case "START_FRESH":
          return {
            state: { step: "guide", afterGuide: "home" },
            effects: ["clear-plan", "show-categories"],
          };
        default:
          return { state, effects: [] };
      }
    case "mood":
      if (event.type === "MOOD_DONE") {
        return { state: { ...state, step: "done" }, effects: ["expand-categories"] };
      }
      return { state, effects: [] };
    case "guide":
      if (event.type === "GUIDE_DONE") {
        return {
          state: { ...state, step: "done", afterGuide: "none" },
          effects: state.afterGuide === "home" ? ["mark-guide-seen", "go-home"] : ["mark-guide-seen"],
        };
      }
      return { state, effects: [] };
    case "done":
      return { state, effects: [] };
  }
}
