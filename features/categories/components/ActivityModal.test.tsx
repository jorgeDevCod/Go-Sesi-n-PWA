import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ActivityModal, type ActivityModalInitial } from "./ActivityModal";
import { updateSubcategoryAction } from "@/features/categories/actions/subcategory.actions";

vi.setConfig({ testTimeout: 20_000 });

vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  createSubcategoryAction: vi.fn(),
  updateSubcategoryAction: vi.fn().mockResolvedValue({ success: true }),
}));

const INITIAL: ActivityModalInitial = {
  id: "sub-1",
  name: "React",
  icon: "Atom",
  color: "#06B6D4",
  complexity: "MEDIUM",
  energyLevel: null,
  energyComplexity: null,
};

function renderModal(initial = INITIAL) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  const props = {
    categoryId: "cat-1",
    categoryName: "Aprender",
    initial,
    onSaved,
    onClose,
  };
  const { rerender } = render(<ActivityModal {...props} open={false} />);
  rerender(<ActivityModal {...props} open />);
  return { onSaved, onClose };
}

describe("ActivityModal simplificado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mantiene nombre, dificultad y energía, sin Programación Pomodoro", () => {
    renderModal();
    expect(screen.getByLabelText("Nombre")).toHaveValue("React");
    expect(screen.getByRole("button", { name: /Baja/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Media/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Alta/ })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Energía" })).toBeInTheDocument();

    expect(screen.queryByText("Programación")).not.toBeInTheDocument();
    expect(screen.queryByText(/Usar el nivel/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aumentar Foco" })).not.toBeInTheDocument();
  });

  it("guarda sin enviar configuración de tiempos", async () => {
    const { onSaved } = renderModal();

    fireEvent.click(screen.getByRole("button", { name: /Alta/ }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(updateSubcategoryAction).toHaveBeenCalled());
    const payload = vi.mocked(updateSubcategoryAction).mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(payload).toEqual(
      expect.objectContaining({ id: "sub-1", complexity: "HIGH" }),
    );
    expect(payload.pomodoroConfig).toBeUndefined();
    expect(onSaved).toHaveBeenCalled();
  });
});
