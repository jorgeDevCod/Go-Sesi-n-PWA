import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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
  it("muestra tabs de tiempos (niveles / por actividad) y la lista", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    expect(screen.getByRole("tab", { name: "Tiempos por nivel" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pomodoro por actividad" })).toBeInTheDocument();
    expect(screen.getByText("lista de actividades")).toBeInTheDocument();
  });

  it("cambia entre niveles y pomodoro por actividad sin apilar ambos", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    expect(screen.getByText("Tiempos pre-programados")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Pomodoro por actividad" }));
    expect(screen.queryByText("Tiempos pre-programados")).not.toBeInTheDocument();
    expect(screen.getByText("Pomodoro por actividad")).toBeInTheDocument();
  });
});
