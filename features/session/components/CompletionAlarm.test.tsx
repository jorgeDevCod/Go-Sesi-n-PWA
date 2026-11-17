import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CompletionAlarm } from "./CompletionAlarm";

describe("CompletionAlarm", () => {
  it("muestra el mensaje, dura 7s y permite finalizar", () => {
    const onDone = vi.fn();
    render(
      <CompletionAlarm
        session={{ subcategoryName: "React", categoryName: "Aprender" }}
        onDone={onDone}
        onExtend={vi.fn()}
        canExtend
      />,
    );
    expect(screen.getByText("React · Aprender")).toBeInTheDocument();
    expect(screen.getByText("Se apagará sola en 7s")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Genial! Vamos por más/i }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("permite agregar minutos y confirma con Iniciemos", () => {
    const onDone = vi.fn();
    const onExtend = vi.fn();
    render(
      <CompletionAlarm
        session={{ subcategoryName: "React", categoryName: "Aprender" }}
        onDone={onDone}
        onExtend={onExtend}
        canExtend
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agregar más tiempo" }));
    const input = screen.getByLabelText("Minutos extra");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Iniciemos" }));
    expect(onExtend).toHaveBeenCalledWith(5);
    expect(onDone).not.toHaveBeenCalled();
  });
});
