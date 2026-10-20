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

describe("RoutineTimePresets (compacto)", () => {
  it("muestra los 3 niveles como tabs dentro de una sola tarjeta", () => {
    render(<RoutineTimePresets />);
    expect(screen.getByRole("tab", { name: /Ligero/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Medio/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Intenso/ })).toBeInTheDocument();
    expect(screen.getByText("Sesión clásica")).toBeInTheDocument();
    expect(screen.getByText("Pomodoro")).toBeInTheDocument();
  });

  it("cambia de nivel al pulsar", () => {
    render(<RoutineTimePresets />);
    fireEvent.click(screen.getByRole("tab", { name: /Intenso/ }));
    expect(screen.getByRole("tab", { name: /Intenso/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("guarda el pomodoro del nivel", () => {
    render(<RoutineTimePresets />);
    fireEvent.click(screen.getByRole("button", { name: "Aumentar Ciclos" }));
    expect(prefs.setPomodoroPreset).toHaveBeenCalledWith(
      "medio",
      expect.objectContaining({ cycles: 4 }),
    );
  });

  it("guarda los tiempos clásicos del nivel", () => {
    render(<RoutineTimePresets />);
    fireEvent.click(screen.getByRole("button", { name: "Aumentar Recomendado" }));
    expect(prefs.setEnergyDuration).toHaveBeenCalledWith("media", 55);
  });
});
