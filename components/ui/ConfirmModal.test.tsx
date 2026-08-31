import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: "Eliminar categoría",
    message: "¿Estás seguro?",
    onConfirm: vi.fn(),
  };

  it("renders nothing when closed", () => {
    render(<ConfirmModal {...defaultProps} open={false} />);
    expect(screen.queryByText("Eliminar categoría")).not.toBeInTheDocument();
  });

  it("renders title and message when open", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("Eliminar categoría")).toBeInTheDocument();
    expect(screen.getByText("¿Estás seguro?")).toBeInTheDocument();
  });

  it("calls onConfirm when clicking confirm button", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    await user.click(screen.getByText("Eliminar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking cancel", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows password input when requirePassword is true", () => {
    render(<ConfirmModal {...defaultProps} requirePassword />);
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
  });

  it("does not show password input when requirePassword is false", () => {
    render(<ConfirmModal {...defaultProps} requirePassword={false} />);
    expect(screen.queryByPlaceholderText("Contraseña")).not.toBeInTheDocument();
  });

  it("disables confirm button when password is empty and required", () => {
    render(<ConfirmModal {...defaultProps} requirePassword password="" />);
    expect(screen.getByText("Eliminar")).toBeDisabled();
  });

  it("enables confirm button when password is provided", () => {
    render(<ConfirmModal {...defaultProps} requirePassword password="abc123" />);
    expect(screen.getByText("Eliminar")).not.toBeDisabled();
  });

  it("shows error message when error is provided", () => {
    render(<ConfirmModal {...defaultProps} error="Contraseña incorrecta." />);
    expect(screen.getByText("Contraseña incorrecta.")).toBeInTheDocument();
  });

  it("shows pending state on confirm button", () => {
    render(<ConfirmModal {...defaultProps} isPending />);
    expect(screen.getByText("Eliminando...")).toBeInTheDocument();
  });

  it("calls onPasswordChange when typing in password input", async () => {
    const onPasswordChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmModal
        {...defaultProps}
        requirePassword
        password=""
        onPasswordChange={onPasswordChange}
      />,
    );
    const input = screen.getByPlaceholderText("Contraseña");
    await user.type(input, "m");
    expect(onPasswordChange).toHaveBeenCalled();
  });
});
