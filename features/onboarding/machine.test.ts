import { describe, expect, it } from "vitest";
import { nextOnboardingState, ONBOARDING_INITIAL } from "./machine";

describe("onboarding machine", () => {
  it("PERSONALIZE cierra y va a personalizar", () => {
    const r = nextOnboardingState(ONBOARDING_INITIAL, { type: "PERSONALIZE" });
    expect(r.state.step).toBe("done");
    expect(r.effects).toEqual(["close-welcome", "go-routine"]);
  });

  it("PLAN cierra y abre planificación", () => {
    const r = nextOnboardingState(ONBOARDING_INITIAL, { type: "PLAN" });
    expect(r.state.step).toBe("done");
    expect(r.effects).toEqual(["close-welcome", "open-planning"]);
  });

  it("RECOMMEND cierra y va a recomendaciones", () => {
    const r = nextOnboardingState(ONBOARDING_INITIAL, { type: "RECOMMEND" });
    expect(r.state.step).toBe("done");
    expect(r.effects).toEqual(["close-welcome", "go-recommend"]);
  });

  it("START con ánimo pendiente abre mood y luego va a Home", () => {
    const mood = nextOnboardingState(ONBOARDING_INITIAL, {
      type: "START",
      needsMood: true,
    });
    expect(mood.state.step).toBe("mood");
    expect(mood.effects).toEqual(["close-welcome", "show-categories", "open-mood"]);

    const done = nextOnboardingState(mood.state, { type: "MOOD_DONE" });
    expect(done.state.step).toBe("done");
    expect(done.effects).toEqual(["expand-categories", "go-home"]);
  });

  it("START sin ánimo pendiente va directo a Home", () => {
    const r = nextOnboardingState(ONBOARDING_INITIAL, {
      type: "START",
      needsMood: false,
    });
    expect(r.state.step).toBe("done");
    expect(r.effects).toEqual(["close-welcome", "show-categories", "go-home"]);
  });

  it("ignora eventos fuera de estado", () => {
    expect(nextOnboardingState({ step: "done" }, { type: "MOOD_DONE" }).effects).toEqual([]);
  });
});
