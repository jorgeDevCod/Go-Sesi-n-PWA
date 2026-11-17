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
  usePathname: () => "/app/actividades",
  useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

const SUBS = { id: "sub-1", name: "React", icon: "Atom", color: "#06B6D4" };

function renderFlow(props?: Partial<Parameters<typeof StartSessionFlow>[0]>) {
  render(
    <StartSessionFlow
      subcategory={SUBS}
      categoryName="Aprender"
      defaultMinutes={50}
      energy="media"
      {...props}
    />,
  );
}

describe("StartSessionFlow (1 pantalla)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("entra a la vista con los modos y sin confirmación intermedia", () => {
    renderFlow();
    expect(screen.getByRole("button", { name: "Clásico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pomodoro" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "COMENZAR" })).not.toBeInTheDocument();
  });

  it("el botón resume el tiempo elegido", () => {
    renderFlow();
    expect(screen.getByRole("button", { name: /Comenzar · 50 min/ })).toBeInTheDocument();
  });

  it("selecciona un chip sin abrir el modal", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: "Elegir 30 minutos" }));
    expect(screen.getByRole("button", { name: /Comenzar · 30 min/ })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre el modal desde Ajustar y aplica el valor escrito", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: /Ajustar/ }));

    const input = screen.getByLabelText("Minutos");
    fireEvent.change(input, { target: { value: "35" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(screen.getByRole("button", { name: /Comenzar · 35 min/ })).toBeInTheDocument();
  });

  it("en Pomodoro selecciona un tier y abre el editor con el lápiz", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));

    expect(screen.getByRole("button", { name: /^Ligero/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Medio/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Intenso/ })).toBeInTheDocument();
    expect(screen.getByText("Tu programación")).toBeInTheDocument();

    expect(screen.queryByLabelText("Foco")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Medio/ }));
    expect(screen.queryByLabelText("Foco")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Editar Medio" }));
    expect(screen.getByLabelText("Foco")).toBeInTheDocument();
    expect(screen.getByLabelText("Descanso")).toBeInTheDocument();
    expect(screen.getByLabelText("Ciclos")).toBeInTheDocument();
  });

  it("edita el foco en el modal y actualiza el plan", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));
    fireEvent.click(screen.getByRole("button", { name: /^Medio/ }));
    fireEvent.click(screen.getByRole("button", { name: "Editar Medio" }));

    const focus = screen.getByLabelText("Foco");
    fireEvent.change(focus, { target: { value: "30" } });
    fireEvent.blur(focus);
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(
      screen.getByRole("button", { name: /Comenzar · 3 ciclos de 30 min/ }),
    ).toBeInTheDocument();
  });

  it("al elegir Intenso se usa su preset", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));
    fireEvent.click(screen.getByRole("button", { name: /^Intenso/ }));

    expect(
      screen.getByRole("button", { name: /Comenzar · 2 ciclos de 75 min/ }),
    ).toBeInTheDocument();
  });

  it("el botón de Pomodoro resume los ciclos", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: "Pomodoro" }));
    expect(
      screen.getByRole("button", { name: /Comenzar · \d+ ciclos de \d+ min/ }),
    ).toBeInTheDocument();
  });

  it("recuerda el último tiempo clásico guardado", () => {
    renderFlow({ lastClassicMinutes: 35 });
    expect(screen.getByRole("button", { name: /Comenzar · 35 min/ })).toBeInTheDocument();
  });

  it("recuerda el último modo Pomodoro", () => {
    renderFlow({ lastMode: "POMODORO" });
    expect(screen.getByRole("button", { name: /^Medio/ })).toBeInTheDocument();
    expect(screen.getByText("Tu programación")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Comenzar · \d+ ciclos de \d+ min/ }),
    ).toBeInTheDocument();
  });
});
