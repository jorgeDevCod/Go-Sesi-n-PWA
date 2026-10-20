import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PomodoroConfigurator } from "./PomodoroConfigurator";

const base = {
  focusMin: 25,
  breakMin: 5,
  cycles: 2,
  autoStart: false,
  longBreakMin: 0,
  skipBreaks: false,
};

describe("PomodoroConfigurator", () => {
  it("ajusta el foco con los steppers", () => {
    const onChange = vi.fn();
    render(<PomodoroConfigurator config={base} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Aumentar Foco (min)" }));
    expect(onChange).toHaveBeenCalledWith({ ...base, focusMin: 30 });
  });

  it("activa el descanso largo con 15 min por defecto", () => {
    const onChange = vi.fn();
    render(<PomodoroConfigurator config={base} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText(/Descanso largo al final/));
    expect(onChange).toHaveBeenCalledWith({ ...base, longBreakMin: 15 });
  });

  it("muestra el resumen del plan y el botón de restablecer cuando aplica", () => {
    const onReset = vi.fn();
    render(
      <PomodoroConfigurator config={base} onChange={vi.fn()} onReset={onReset} showReset />,
    );
    expect(screen.getByText(/2 ciclos de 25 min/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Restablecer" }));
    expect(onReset).toHaveBeenCalled();
  });

  it("el resumen refleja descansos largos y ciclos encadenados", () => {
    const { rerender } = render(
      <PomodoroConfigurator config={{ ...base, longBreakMin: 15 }} onChange={vi.fn()} />,
    );
    expect(screen.getByText(/descanso largo de 15 min/)).toBeInTheDocument();
    rerender(
      <PomodoroConfigurator config={{ ...base, skipBreaks: true }} onChange={vi.fn()} />,
    );
    expect(screen.getByText(/2 ciclos de 25 min · sin descansos/)).toBeInTheDocument();
  });
});
