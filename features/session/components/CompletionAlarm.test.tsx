import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CompletionAlarm } from "./CompletionAlarm";

describe("CompletionAlarm", () => {
  it("muestra mensaje y cuenta regresiva, y avisa al descartar", () => {
    const onDone = vi.fn();
    render(
      <CompletionAlarm
        session={{ subcategoryName: "React", categoryName: "Aprender" }}
        onDone={onDone}
      />,
    );
    expect(screen.getByText("React · Aprender")).toBeInTheDocument();
    expect(screen.getByText("Se apagará sola en 15s")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "¡Genial! Vamos por más" }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
