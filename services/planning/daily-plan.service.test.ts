import { beforeEach, describe, expect, it, vi } from "vitest";
import { deriveItemPracticed, removePlanItem, updatePlanItemDetails } from "./daily-plan.service";
import { PlanItemForbiddenError, PlanItemNotFoundError } from "./plan-item.errors";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    findPlanItemById: vi.fn(),
    updatePlanItem: vi.fn(),
    deletePlanItem: vi.fn(),
  },
}));

vi.mock("@/repositories/planning.repository", () => ({
  findPlanByUserAndDate: vi.fn(),
  findPlanItemById: mocks.findPlanItemById,
  createPlan: vi.fn(),
  updatePlanItems: vi.fn(),
  updatePlanItem: mocks.updatePlanItem,
  deletePlanItem: mocks.deletePlanItem,
}));

describe("plan item ownership (IDOR)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("update propio pasa", async () => {
    mocks.findPlanItemById.mockResolvedValue({ id: "item-1", plan: { userId: "A" } });
    mocks.updatePlanItem.mockResolvedValue({ id: "item-1" });
    await updatePlanItemDetails("item-1", "A", { title: "Hoy" });
    expect(mocks.updatePlanItem).toHaveBeenCalledWith("item-1", { title: "Hoy" });
  });

  it("update ajeno lanza Forbidden y no escribe", async () => {
    mocks.findPlanItemById.mockResolvedValue({ id: "item-1", plan: { userId: "B" } });
    await expect(updatePlanItemDetails("item-1", "A", { title: "X" })).rejects.toBeInstanceOf(
      PlanItemForbiddenError,
    );
    expect(mocks.updatePlanItem).not.toHaveBeenCalled();
  });

  it("update inexistente lanza NotFound", async () => {
    mocks.findPlanItemById.mockResolvedValue(null);
    await expect(updatePlanItemDetails("nope", "A", { title: "X" })).rejects.toBeInstanceOf(
      PlanItemNotFoundError,
    );
  });

  it("delete propio pasa", async () => {
    mocks.findPlanItemById.mockResolvedValue({ id: "item-2", plan: { userId: "A" } });
    mocks.deletePlanItem.mockResolvedValue({ id: "item-2" });
    await removePlanItem("item-2", "A");
    expect(mocks.deletePlanItem).toHaveBeenCalledWith("item-2");
  });

  it("delete ajeno lanza Forbidden y no borra", async () => {
    mocks.findPlanItemById.mockResolvedValue({ id: "item-2", plan: { userId: "B" } });
    await expect(removePlanItem("item-2", "A")).rejects.toBeInstanceOf(PlanItemForbiddenError);
    expect(mocks.deletePlanItem).not.toHaveBeenCalled();
  });
});

describe("deriveItemPracticed (badge Realizada por actividad)", () => {
  const subs = new Set(["sub-hecha"]);
  const cats = new Set(["cat-hecha"]);

  it("actividad practicada marca true", () => {
    expect(
      deriveItemPracticed({ categoryId: "cat-1", subcategoryId: "sub-hecha" }, subs, cats),
    ).toBe(true);
  });

  it("hermana de la misma categoría NO practicada marca false (regresión V-02)", () => {
    expect(
      deriveItemPracticed({ categoryId: "cat-hecha", subcategoryId: "sub-otra" }, subs, cats),
    ).toBe(false);
  });

  it("item de categoría (sin actividad) conserva criterio por categoría", () => {
    expect(deriveItemPracticed({ categoryId: "cat-hecha", subcategoryId: null }, subs, cats)).toBe(
      true,
    );
    expect(deriveItemPracticed({ categoryId: "cat-otra", subcategoryId: null }, subs, cats)).toBe(
      false,
    );
  });

  it("item sin categoría ni actividad marca false", () => {
    expect(deriveItemPracticed({ categoryId: null, subcategoryId: null }, subs, cats)).toBe(false);
  });
});
