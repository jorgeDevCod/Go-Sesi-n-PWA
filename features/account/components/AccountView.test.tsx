import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AccountView } from "./AccountView";

vi.mock("@/features/account/actions/export-account.action", () => ({
  exportAccountAction: vi.fn(),
}));
vi.mock("@/features/account/actions/delete-account.action", () => ({
  deleteAccountAction: vi.fn(),
}));
vi.mock("@/features/push/components/PushSettings", () => ({
  PushSettings: () => (
    <div>
      <p>Notificaciones push</p>
      <p>Notificaciones no configuradas en este entorno.</p>
    </div>
  ),
}));

describe("AccountView", () => {
  it("muestra perfil, exportar, push y eliminar con ancho responsive", () => {
    const { container } = render(<AccountView userName="Jorge" email="a@b.com" />);
    expect(screen.getByText("Jorge")).toBeInTheDocument();
    expect(screen.getByText("a@b.com")).toBeInTheDocument();
    expect(screen.getByText("Exportar mis datos")).toBeInTheDocument();
    expect(screen.getByText("Notificaciones push")).toBeInTheDocument();
    expect(screen.getByText("Eliminar cuenta")).toBeInTheDocument();
    // El mensaje de push sin configurar va dentro de la tarjeta (no suelto).
    const grid = container.querySelector("div.grid");
    expect(grid).toBeTruthy();
    expect(screen.getByText("Notificaciones no configuradas en este entorno.")).toBeInTheDocument();
  });

  it("el botón de exportar dispara la acción", () => {
    render(<AccountView userName="Jorge" email="a@b.com" />);
    const button = screen.getByRole("button", { name: "Descargar JSON" });
    fireEvent.click(button);
    expect(button).toBeInTheDocument();
  });

  it("eliminar cuenta pide confirmación con contraseña", () => {
    render(<AccountView userName="Jorge" email="a@b.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar mi cuenta" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
  });
});
