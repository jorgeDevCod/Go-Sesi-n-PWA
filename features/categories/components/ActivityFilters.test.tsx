import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActivityFilters } from "./ActivityFilters";

function openFilters() {
  fireEvent.click(
    screen.getByRole("button", { name: "Filtrar por dificultades" }),
  );
}

describe("ActivityFilters (solo dificultad)", () => {
  it("inicia cerrado e indica cómo abrir el filtro", () => {
    render(<ActivityFilters selectedDifficulties={[]} onToggleDifficulty={vi.fn()} />);
    const trigger = screen.getByRole("button", {
      name: "Filtrar por dificultades",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: "Todas las actividades" }),
    ).not.toBeInTheDocument();
  });

  it("muestra Todas + las tres dificultades y ninguna sección de energía", () => {
    render(<ActivityFilters selectedDifficulties={[]} onToggleDifficulty={vi.fn()} />);
    openFilters();
    expect(
      screen.getByRole("button", { name: "Todas las actividades" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ligera" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Moderada" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Intensa" })).toBeInTheDocument();
    expect(screen.queryByText(/energía|ánimo/i)).not.toBeInTheDocument();
  });

  it("Todas está activa cuando no hay selección", () => {
    render(<ActivityFilters selectedDifficulties={[]} onToggleDifficulty={vi.fn()} />);
    openFilters();
    expect(
      screen.getByRole("button", { name: "Todas las actividades" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Ligera" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("al pulsar una dificultad la marca y avisa", () => {
    const onToggle = vi.fn();
    render(<ActivityFilters selectedDifficulties={["LOW"]} onToggleDifficulty={onToggle} />);
    openFilters();
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
    openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Todas las actividades" }));
    expect(onToggle).toHaveBeenCalledWith("LOW");
    expect(onToggle).toHaveBeenCalledWith("HIGH");
  });
});
