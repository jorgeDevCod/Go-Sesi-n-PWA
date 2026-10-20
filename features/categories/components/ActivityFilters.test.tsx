import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActivityFilters } from "./ActivityFilters";

describe("ActivityFilters (solo dificultad)", () => {
  it("muestra Todas + las tres dificultades y ninguna sección de energía", () => {
    render(<ActivityFilters selectedDifficulties={[]} onToggleDifficulty={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Todas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ligera" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Moderada" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Intensa" })).toBeInTheDocument();
    expect(screen.queryByText(/energía|ánimo/i)).not.toBeInTheDocument();
  });

  it("Todas está activa cuando no hay selección", () => {
    render(<ActivityFilters selectedDifficulties={[]} onToggleDifficulty={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Ligera" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("al pulsar una dificultad la marca y avisa", () => {
    const onToggle = vi.fn();
    render(<ActivityFilters selectedDifficulties={["LOW"]} onToggleDifficulty={onToggle} />);
    expect(screen.getByRole("button", { name: "Ligera" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Intensa" }));
    expect(onToggle).toHaveBeenCalledWith("HIGH");
  });

  it("pulsar Todas limpia las selecciones", () => {
    const onToggle = vi.fn();
    render(<ActivityFilters selectedDifficulties={["LOW", "HIGH"]} onToggleDifficulty={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: "Todas" }));
    expect(onToggle).toHaveBeenCalledWith("LOW");
    expect(onToggle).toHaveBeenCalledWith("HIGH");
  });
});
