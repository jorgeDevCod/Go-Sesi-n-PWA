import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StartSessionFlow } from "./StartSessionFlow";

vi.mock("@/features/session/actions/session.actions", () => ({
  startSessionAction: vi.fn().mockResolvedValue({ success: true, session: {} }),
}));
vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  setActivityPomodoroAction: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

const SUBS = { id: "sub-1", name: "React", icon: "Atom", color: "#06B6D4" };

describe("StartSessionFlow (1 pantalla)", () => {
  it("siempre entra a la vista con tabs, incluso con minutos sugeridos", () => {
    render(
      <StartSessionFlow subcategory={SUBS} categoryName="Aprender" defaultMinutes={50} energy="media" />,
    );
    expect(screen.getByRole("button", { name: "Clásico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pomodoro" })).toBeInTheDocument();
    // No existe pantalla de confirmación intermedia.
    expect(screen.queryByRole("button", { name: "COMENZAR" })).not.toBeInTheDocument();
  });

  it("el botón resume el tiempo elegido", () => {
    render(
      <StartSessionFlow subcategory={SUBS} categoryName="Aprender" defaultMinutes={50} energy="media" />,
    );
    expect(screen.getByRole("button", { name: /Comenzar · 50 min/ })).toBeInTheDocument();
  });

  it("no muestra el mensaje de guía eliminado", () => {
    render(<StartSessionFlow subcategory={SUBS} categoryName="Aprender" energy="media" />);
    expect(screen.queryByText(/Elige el tiempo que te funcione/i)).not.toBeInTheDocument();
  });

  it("en Pomodoro muestra los 3 niveles y el ajuste colapsado", () => {
    render(<StartSessionFlow subcategory={SUBS} categoryName="Aprender" energy="media" />);
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));
    expect(screen.getByRole("button", { name: /Ligero/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Medio/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Intenso/ })).toBeInTheDocument();
    const adjust = screen.getByRole("button", { name: "Ajustar" });
    expect(adjust).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(adjust);
    expect(adjust).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Guardar como predeterminado de React/ })).toBeInTheDocument();
  });

  it("el botón de Pomodoro resume los ciclos", () => {
    render(<StartSessionFlow subcategory={SUBS} categoryName="Aprender" energy="media" />);
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));
    expect(screen.getByRole("button", { name: /Comenzar · \d+ ciclos de \d+ min/ })).toBeInTheDocument();
  });
});
