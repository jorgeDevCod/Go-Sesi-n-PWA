import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PlanningModal } from "./PlanningModal";

vi.setConfig({ testTimeout: 20_000 });

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/features/categories/actions/category.actions", () => ({
  createCategoryAction: vi.fn().mockResolvedValue({ success: true, category: {} }),
}));

vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  createSubcategoryAction: vi.fn(),
  updateSubcategoryAction: vi.fn(),
}));

const CATEGORIES = [
  {
    id: "cat-1",
    name: "Aprender",
    icon: "BookOpen",
    color: "#6366F1",
    subcategories: [
      { id: "sub-1", name: "Leer", icon: "Book", color: "#6366F1" },
      { id: "sub-2", name: "Escribir", icon: "Pencil", color: "#8B5CF6" },
    ],
  },
  {
    id: "cat-2",
    name: "Diversión",
    icon: "Gamepad2",
    color: "#EC4899",
    subcategories: [
      { id: "sub-3", name: "Jugar", icon: "Gamepad2", color: "#EC4899" },
    ],
  },
];

function renderModal(existingItems = []) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  const onSkip = vi.fn();
  const props = {
    userName: "Jorge",
    categories: CATEGORIES,
    existingItems,
    onSave,
    onClose,
    onSkip,
    isPending: false,
  };
  const { rerender } = render(<PlanningModal {...props} open={false} />);
  rerender(<PlanningModal {...props} open />);
  return { onSave, onClose, onSkip };
}

describe("PlanningModal unificado", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("muestra categorías y las actividades de la categoría activa", () => {
    renderModal();
    expect(screen.getByText("¡Hola Jorge! ¿Qué haremos hoy?")).toBeInTheDocument();
    expect(screen.getByText("Esta es tu Planificación")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Diversión/ }));
    expect(screen.getByRole("button", { name: /Jugar/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Leer/ })).not.toBeInTheDocument();
  });

  it("agrega actividades de distintas categorías a una sola planificación", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Leer/ }));
    fireEvent.click(screen.getByRole("button", { name: /Diversión/ }));
    fireEvent.click(screen.getByRole("button", { name: /Jugar/ }));

    expect(screen.getAllByText("Leer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jugar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aprender").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Diversión").length).toBeGreaterThan(0);
  });

  it("quita todo y guarda solo las actividades seleccionadas", () => {
    const { onSave } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Leer/ }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar planificación" }));

    expect(onSave).toHaveBeenCalledWith([
      expect.objectContaining({ subcategoryId: "sub-1", categoryId: "cat-1" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: /Quitar todo/ }));
    expect(screen.getByText("Aún no has elegido actividades")).toBeInTheDocument();
  });
});
