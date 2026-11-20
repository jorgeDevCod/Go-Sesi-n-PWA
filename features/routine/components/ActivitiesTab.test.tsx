import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActivitiesTab } from "./ActivitiesTab";
import type { SubcategoryItem } from "@/features/categories/store/subcategory.store";

vi.mock("@/features/categories/components/SubcategoryList", () => ({
  SubcategoryList: () => <div>lista de actividades</div>,
}));

const CATEGORIES = [
  {
    id: "cat-1",
    key: "aprender",
    name: "Aprender",
    icon: "BookOpen",
    color: "#6366F1",
    isDefault: true,
    complexity: "MEDIUM" as const,
  },
  {
    id: "cat-2",
    key: "diversion",
    name: "Diversión",
    icon: "Gamepad2",
    color: "#EC4899",
    isDefault: true,
    complexity: "LOW" as const,
  },
];

const ITEMS = {
  "cat-1": [
    {
      id: "act-1",
      name: "Inglés",
      icon: "Languages",
      color: "#38BDF8",
      order: 0,
      categoryId: "cat-1",
      complexity: "LOW",
    },
  ],
  "cat-2": [
    {
      id: "act-2",
      name: "Videojuegos",
      icon: "Gamepad2",
      color: "#EC4899",
      order: 0,
      categoryId: "cat-2",
      complexity: "LOW",
    },
  ],
} satisfies Record<string, SubcategoryItem[]>;

describe("ActivitiesTab", () => {
  it("muestra el desplegable cerrado y las actividades al abrirlo", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    const toggle = screen.getByRole("button", { name: "Cambiar de categoría" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: /Aprender/ })).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Aprender/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Diversión/ })).toBeInTheDocument();
    expect(screen.getByText("lista de actividades")).toBeInTheDocument();
  });

  it("busca actividades de cualquier categoría y también categorías", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={ITEMS} />);
    const search = screen.getByRole("textbox", {
      name: "Buscar actividades o categorías",
    });

    fireEvent.change(search, { target: { value: "video" } });
    expect(screen.getByText("Videojuegos")).toBeInTheDocument();
    expect(screen.getByText(/Diversión · Ligera/)).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "aprender" } });
    expect(screen.getByText("Aprender")).toBeInTheDocument();
    expect(screen.getByText("Categoría")).toBeInTheDocument();
    expect(screen.getByText("Inglés")).toBeInTheDocument();
  });

  it("no muestra configuraciones de tiempos ni el tab de Pomodoro por actividad", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    expect(screen.queryByText("Tiempos pre-programados")).not.toBeInTheDocument();
    expect(screen.queryByText("Pomodoro por actividad")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Pomodoro por actividad" })).not.toBeInTheDocument();
  });

  it("cambia de categoría sin volver al Home", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar de categoría" }));
    const diversion = screen.getByRole("button", { name: /Diversión/ });
    fireEvent.click(diversion);
    expect(screen.getByRole("button", { name: "Cambiar de categoría" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
