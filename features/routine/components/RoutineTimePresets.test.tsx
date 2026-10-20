import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RoutineTimePresets } from "./RoutineTimePresets";

vi.mock("@/features/recommendation/store/recommendation.store", () => ({
  useRecommendationPrefs: () => prefs,
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

describe("RoutineTimePresets", () => {
  it("muestra los 3 niveles como tabs y el de tiempos clásicos", () => {
    render(<RoutineTimePresets />);
    expect(screen.getByRole("button", { name: /Ligero/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Medio/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Intenso/ })).toBeInTheDocument();
    expect(screen.getByText("Tiempos clásicos")).toBeInTheDocument();
    expect(screen.getByText("Pomodoro de medio")).toBeInTheDocument();
  });

  it("cambia de nivel al pulsar", () => {
    render(<RoutineTimePresets />);
    fireEvent.click(screen.getByRole("button", { name: /Intenso/ }));
    expect(screen.getByText("Pomodoro de intenso")).toBeInTheDocument();
  });

  it("guarda el pomodoro del nivel", () => {
    render(<RoutineTimePresets />);
    fireEvent.click(screen.getByRole("button", { name: "Aumentar Ciclos" }));
    expect(prefs.setPomodoroPreset).toHaveBeenCalledWith(
      "medio",
      expect.objectContaining({ cycles: 4 }),
    );
  });
});
