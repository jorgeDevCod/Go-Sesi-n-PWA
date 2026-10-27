import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionWizard } from "./SessionWizard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/features/session/actions/session.actions", () => ({
  startSessionAction: vi.fn(),
}));

vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  setActivityPomodoroAction: vi.fn(),
  saveActivityTimerPreferenceAction: vi.fn(),
}));

vi.mock("@/features/recommendation/store/recommendation.store", () => ({
  useRecommendationPrefs: () => ({
    energy: "media",
    pomodoroPresets: {},
    pomodoroConfigs: {},
    setEnergy: vi.fn(),
    energyDurations: {},
    energyMinDurations: {},
    energyMaxDurations: {},
    energyComplexityTargets: {},
    difficultyDurations: {},
    difficultyMinDurations: {},
    difficultyMaxDurations: {},
    energyCategoryIds: {},
    energySubcategoryIds: {},
    recommendationCombos: {},
  }),
  recommendationOverridesFromPrefs: (prefs: Record<string, unknown>) => prefs,
}));

const SUBS = [
  { id: "sub-1", name: "React", icon: "Atom", color: "#06B6D4", complexity: "MEDIUM" as const },
  { id: "sub-2", name: "Inglés", icon: "Languages", color: "#0EA5E9", complexity: "LOW" as const },
];

describe("SessionWizard sin lista duplicada", () => {
  it("abre directo la actividad del deep-link", () => {
    render(<SessionWizard categoryName="Aprender" subcategories={SUBS} startWithId="sub-2" />);
    expect(screen.getByText("Inglés")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clásico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pomodoro" })).toBeInTheDocument();
  });

  it("no renderiza una lista si el id no es válido", () => {
    const { container } = render(
      <SessionWizard categoryName="Aprender" subcategories={SUBS} startWithId="nope" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("no renderiza lista si falta el id", () => {
    const { container } = render(
      <SessionWizard categoryName="Aprender" subcategories={SUBS} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
