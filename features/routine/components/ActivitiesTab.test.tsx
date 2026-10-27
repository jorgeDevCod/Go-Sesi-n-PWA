import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActivitiesTab } from "./ActivitiesTab";

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

describe("ActivitiesTab", () => {
  it("muestra las categorías y la lista de actividades", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    expect(screen.getByRole("button", { name: /Aprender/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Diversión/ })).toBeInTheDocument();
    expect(screen.getByText("lista de actividades")).toBeInTheDocument();
  });

  it("no muestra configuraciones de tiempos ni el tab de Pomodoro por actividad", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    expect(screen.queryByText("Tiempos pre-programados")).not.toBeInTheDocument();
    expect(screen.queryByText("Pomodoro por actividad")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Pomodoro por actividad" })).not.toBeInTheDocument();
  });

  it("cambia de categoría sin volver al Home", () => {
    render(<ActivitiesTab categories={CATEGORIES} itemsByCategory={{}} />);
    const diversion = screen.getByRole("button", { name: /Diversión/ });
    fireEvent.click(diversion);
    expect(diversion).toHaveAttribute("aria-pressed", "true");
  });
});
