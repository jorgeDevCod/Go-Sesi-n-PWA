import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryHomeGrid } from "./CategoryHomeGrid";
import type { CategoryHomeData } from "./CategoryHomeCard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/features/categories/actions/category.actions", () => ({
  createCategoryAction: vi.fn().mockResolvedValue({ success: true, category: {} as never }),
}));

vi.mock("@/features/categories/components/CreateCategoryCard", () => ({
  CreateCategoryCard: () => <button type="button">Crear Nueva categoría</button>,
}));

vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  createSubcategoryAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/features/planning/actions/planning.actions", () => ({
  getTodayPlanAction: vi.fn().mockResolvedValue({ success: true, plan: null }),
  saveTodayPlanAction: vi.fn().mockResolvedValue({ success: true }),
  updatePlanItemAction: vi.fn().mockResolvedValue({ success: true }),
  deletePlanItemAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/features/planning/components/PlanningModal", () => ({
  PlanningModal: () => null,
}));

vi.mock("@/features/planning/components/ExistingPlanPrompt", () => ({
  ExistingPlanPrompt: () => null,
}));

const categories: CategoryHomeData[] = [
  { id: "cat-1", key: null, name: "Aprender", icon: "BookOpen", color: "#6366F1", isDefault: false, complexity: "MEDIUM", subcategoryCount: 0 },
  { id: "cat-2", key: null, name: "Salud", icon: "Dumbbell", color: "#22C55E", isDefault: false, complexity: "MEDIUM", subcategoryCount: 2 },
];

describe("CategoryHomeGrid", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("shows all categories by default", async () => {
    render(<CategoryHomeGrid initialCategories={categories} />);
    expect(screen.getByText("Aprender")).toBeInTheDocument();
    expect(screen.getByText("Salud")).toBeInTheDocument();
  });
});
