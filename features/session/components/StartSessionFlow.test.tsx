import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StartSessionFlow } from "./StartSessionFlow";

vi.mock("@/features/session/actions/session.actions", () => ({
  startSessionAction: vi.fn().mockResolvedValue({ success: true, session: {} }),
}));
vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  setActivityPomodoroAction: vi.fn().mockResolvedValue({ success: true }),
  saveActivityTimerPreferenceAction: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

const SUBS = { id: "sub-1", name: "React", icon: "Atom", color: "#06B6D4" };

describe("StartSessionFlow (1 pantalla)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("entra a la vista con los modos y sin confirmación intermedia", () => {
    render(
      <StartSessionFlow subcategory={SUBS} categoryName="Aprender" defaultMinutes={50} energy="media" />,
    );
    expect(screen.getByRole("button", { name: "Clásico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pomodoro" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "COMENZAR" })).not.toBeInTheDocument();
  });

  it("el botón resume el tiempo elegido", () => {
    render(
      <StartSessionFlow subcategory={SUBS} categoryName="Aprender" defaultMinutes={50} energy="media" />,
    );
    expect(screen.getByRole("button", { name: /Comenzar · 50 min/ })).toBeInTheDocument();
  });

  it("permite escribir cualquier tiempo y actualiza el resumen", () => {
    render(
      <StartSessionFlow subcategory={SUBS} categoryName="Aprender" defaultMinutes={50} energy="media" />,
    );
    const input = screen.getByLabelText("Minutos de la sesión");
    fireEvent.change(input, { target: { value: "35" } });
    fireEvent.blur(input);
    expect(screen.getByRole("button", { name: /Comenzar · 35 min/ })).toBeInTheDocument();
  });

  it("en Pomodoro muestra las 3 tarjetas y los campos editables", () => {
    render(<StartSessionFlow subcategory={SUBS} categoryName="Aprender" energy="media" />);
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));

    expect(screen.getByRole("button", { name: /Ligero/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Medio/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Intenso/ })).toBeInTheDocument();

    expect(screen.getByLabelText("Foco")).toBeInTheDocument();
    expect(screen.getByLabelText("Descanso")).toBeInTheDocument();
    expect(screen.getByLabelText("Ciclos")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Ajustar" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Guardar como predeterminado/ }),
    ).not.toBeInTheDocument();
  });

  it("edita el foco directamente y actualiza el plan", () => {
    render(<StartSessionFlow subcategory={SUBS} categoryName="Aprender" energy="media" />);
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));

    const focus = screen.getByLabelText("Foco");
    fireEvent.change(focus, { target: { value: "30" } });
    fireEvent.blur(focus);

    expect(
      screen.getByRole("button", { name: /Comenzar · 3 ciclos de 30 min/ }),
    ).toBeInTheDocument();
  });

  it("al elegir Intenso aplica su preset", () => {
    render(<StartSessionFlow subcategory={SUBS} categoryName="Aprender" energy="media" />);
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));
    fireEvent.click(screen.getByRole("button", { name: /Intenso/ }));

    expect(
      screen.getByRole("button", { name: /Comenzar · 2 ciclos de 75 min/ }),
    ).toBeInTheDocument();
  });

  it("el botón de Pomodoro resume los ciclos", () => {
    render(<StartSessionFlow subcategory={SUBS} categoryName="Aprender" energy="media" />);
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));
    expect(
      screen.getByRole("button", { name: /Comenzar · \d+ ciclos de \d+ min/ }),
    ).toBeInTheDocument();
  });

  it("recuerda el último tiempo clásico guardado", () => {
    render(
      <StartSessionFlow
        subcategory={SUBS}
        categoryName="Aprender"
        defaultMinutes={50}
        energy="media"
        lastClassicMinutes={35}
      />,
    );
    expect(screen.getByRole("button", { name: /Comenzar · 35 min/ })).toBeInTheDocument();
  });

  it("recuerda el último modo Pomodoro", () => {
    render(
      <StartSessionFlow
        subcategory={SUBS}
        categoryName="Aprender"
        energy="media"
        lastMode="POMODORO"
      />,
    );
    expect(screen.getByLabelText("Foco")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Comenzar · \d+ ciclos de \d+ min/ }),
    ).toBeInTheDocument();
  });
});
