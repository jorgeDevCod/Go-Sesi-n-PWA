import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WelcomeModal } from "./WelcomeModal";

vi.setConfig({ testTimeout: 20_000 });

function renderModal() {
  const onConfirm = vi.fn();
  const onSwitchAccount = vi.fn();
  const onDontShowToday = vi.fn();
  const props = {
    userName: "Jorge",
    onConfirm,
    onSwitchAccount,
    onDontShowToday,
  };
  const { rerender } = render(<WelcomeModal {...props} open={false} />);
  rerender(<WelcomeModal {...props} open />);
  return { onConfirm, onSwitchAccount, onDontShowToday };
}

describe("WelcomeModal", () => {
  it("muestra las 4 opciones y preselecciona Vamos Ya", () => {
    renderModal();
    expect(screen.getByText("¡Bienvenido de nuevo, Jorge!")).toBeInTheDocument();
    expect(screen.getByText("Hoy es un buen día para iniciar tus planes. Elige cómo quieres iniciar y empecemos a avanzar.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /¡Vamos Ya!/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Recibir una recomendación/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Quiero planificar mi día/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Personalizar mi Experiencia/ })).toBeInTheDocument();
  });

  it("seleccionar no navega; Ingresar ejecuta la opción elegida", () => {
    const { onConfirm } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Recibir una recomendación/ }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /Recibir una recomendación/ }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(onConfirm).toHaveBeenCalledWith("recommend");
  });

  it("cambiar de cuenta ejecuta el logout", () => {
    const { onSwitchAccount } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Cambiar de cuenta/ }));
    expect(onSwitchAccount).toHaveBeenCalledTimes(1);
  });
});
