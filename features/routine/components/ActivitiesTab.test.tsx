import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivitiesTab } from "./ActivitiesTab";

vi.mock("@/features/recommendation/store/recommendation.store", () => ({
  useRecommendationPrefs: () => prefs,
}));

vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  setActivityPomodoroAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/features/categories/components/SubcategoryList", () => ({
  SubcategoryList: () => <div>lista de actividades</div>,
}));

const prefs = {
  energyDurations: {} as Record<string, number>,
  energyMinDurations: {} as Record<string, number>,
  energyMaxDurations: {} as Record<string, number>,
  pomodoroPresets: {} as Record<string, unknown>,
  setEnergyDuration: vi.fn(),
  setEnergyMinDuration: vi.fn(),
  setEnergyMaxDuration: vi.fn(),
  setPomodoroPreset: vi.fn(),
  removePomodoroPreset: vi.fn(),
};

const CATEGORIES = [
  {
    id: "cat-1",
    key: "aprender",
    name: "Aprender",
    icon: "BookOpen",
    color: "#6366F1",
    isDefault: true,
    complexity: "MEDIUM" as const,
  },
];

describe("ActivitiesTab", () => {
  it("muestra los tiempos por nivel y la lista de actividades", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    expect(screen.getByText("Tiempos pre-programados")).toBeInTheDocument();
    expect(screen.getByText("lista de actividades")).toBeInTheDocument();
  });

  it("no muestra el tab redundante de pomodoro por actividad", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    expect(screen.queryByText("Pomodoro por actividad")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Pomodoro por actividad" })).not.toBeInTheDocument();
  });
});
