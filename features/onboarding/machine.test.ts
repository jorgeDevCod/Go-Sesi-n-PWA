import { describe, expect, it } from "vitest";
import { nextOnboardingState, ONBOARDING_INITIAL } from "./machine";

describe("onboarding machine", () => {
  it("PERSONALIZE cierra y va a rutina", () => {
    const r = nextOnboardingState(ONBOARDING_INITIAL, { type: "PERSONALIZE" });
    expect(r.state.step).toBe("done");
    expect(r.effects).toEqual(["close-welcome", "go-routine"]);
  });

  it("PLAN cierra y abre planificación", () => {
    const r = nextOnboardingState(ONBOARDING_INITIAL, { type: "PLAN" });
    expect(r.state.step).toBe("done");
    expect(r.effects).toEqual(["close-welcome", "open-planning"]);
  });

  it("LEARN con plan va a plan-continue; sin plan a guía", () => {
    expect(
      nextOnboardingState(ONBOARDING_INITIAL, { type: "LEARN", hasPlan: true }).state.step,
    ).toBe("plan-continue");
    const noPlan = nextOnboardingState(ONBOARDING_INITIAL, { type: "LEARN", hasPlan: false });
    expect(noPlan.state.step).toBe("guide");
    expect(noPlan.effects).toEqual(["close-welcome"]);
  });

  it("SKIP con ánimo pendiente abre mood; sin pendiente termina", () => {
    const mood = nextOnboardingState(ONBOARDING_INITIAL, { type: "SKIP", needsMood: true });
    expect(mood.state.step).toBe("mood");
    expect(mood.effects).toEqual(["close-welcome", "show-categories", "open-mood"]);
    const done = nextOnboardingState(ONBOARDING_INITIAL, { type: "SKIP", needsMood: false });
    expect(done.state.step).toBe("done");
  });

  it("START_FRESH limpia y vuelve al home tras la guía; KEEP no redirige", () => {
    const continued = nextOnboardingState(
      { step: "plan-continue", afterGuide: "none" },
      { type: "KEEP_PLAN" },
    );
    expect(continued.state).toEqual({ step: "guide", afterGuide: "none" });
    const fresh = nextOnboardingState(
      { step: "plan-continue", afterGuide: "none" },
      { type: "START_FRESH" },
    );
    expect(fresh.effects).toEqual(["clear-plan", "show-categories"]);
    const closed = nextOnboardingState(fresh.state, { type: "GUIDE_DONE" });
    expect(closed.state.step).toBe("done");
    expect(closed.effects).toEqual(["mark-guide-seen", "go-home"]);
    const closedKeep = nextOnboardingState(continued.state, { type: "GUIDE_DONE" });
    expect(closedKeep.effects).toEqual(["mark-guide-seen"]);
  });

  it("MOOD_DONE expande categorías y eventos fuera de estado se ignoran", () => {
    const r = nextOnboardingState({ step: "mood", afterGuide: "none" }, { type: "MOOD_DONE" });
    expect(r.state.step).toBe("done");
    expect(r.effects).toEqual(["expand-categories"]);
    expect(
      nextOnboardingState(ONBOARDING_INITIAL, { type: "MOOD_DONE" }).effects,
    ).toEqual([]);
  });
});
