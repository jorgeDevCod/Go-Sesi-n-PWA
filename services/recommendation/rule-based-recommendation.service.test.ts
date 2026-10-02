import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  hourInTimeZone,
  ruleBasedRecommendationService,
} from "./rule-based-recommendation.service";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    listSubcategoriesByUser: vi.fn(),
    listCategoriesForUser: vi.fn(),
    getLastPracticedAtBySubcategory: vi.fn(),
    getCompletionBySubcategory: vi.fn(),
    getTodayPlan: vi.fn(),
    getFeedbackMap: vi.fn(),
  },
}));

vi.mock("@/repositories/subcategory.repository", () => ({
  listSubcategoriesByUser: mocks.listSubcategoriesByUser,
}));
vi.mock("@/repositories/category.repository", () => ({
  listCategoriesForUser: mocks.listCategoriesForUser,
}));
vi.mock("@/repositories/focus-session.repository", () => ({
  getLastPracticedAtBySubcategory: mocks.getLastPracticedAtBySubcategory,
  getCompletionBySubcategory: mocks.getCompletionBySubcategory,
}));
vi.mock("@/services/planning/daily-plan.service", () => ({
  getTodayPlan: mocks.getTodayPlan,
}));
vi.mock("@/repositories/recommendation-feedback.repository", () => ({
  getFeedbackMap: mocks.getFeedbackMap,
}));

const CAT = {
  id: "cat-1",
  key: "trabajo",
  name: "Trabajo",
  complexity: "MEDIUM",
  energyLevel: null,
  energyComplexity: null,
};

function sub(id: string) {
  return {
    id,
    name: id,
    icon: "Star",
    color: "#fff",
    complexity: "MEDIUM",
    categoryId: "cat-1",
    energyLevel: null,
    energyComplexity: null,
  };
}

// Mediodía Lima: sin tope nocturno.
const NOON_LIMA = new Date("2026-10-01T17:00:00.000Z").getTime();
// 20:30 Lima: con tope nocturno de 25 min.
const NIGHT_LIMA = new Date("2026-10-02T01:30:00.000Z").getTime();

describe("rule-based v2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listSubcategoriesByUser.mockResolvedValue([sub("sub-1"), sub("sub-2")]);
    mocks.listCategoriesForUser.mockResolvedValue([CAT]);
    mocks.getLastPracticedAtBySubcategory.mockResolvedValue(new Map());
    mocks.getCompletionBySubcategory.mockResolvedValue(new Map());
    mocks.getTodayPlan.mockResolvedValue(null);
    mocks.getFeedbackMap.mockResolvedValue(new Map());
  });

  it("hourInTimeZone respeta Lima", () => {
    expect(hourInTimeZone(new Date("2026-10-02T01:30:00.000Z").getTime())).toBe(20);
  });

  it("plan de hoy sube la actividad y añade razón", async () => {
    mocks.getTodayPlan.mockResolvedValue({ items: [{ subcategoryId: "sub-2" }] });
    const list = await ruleBasedRecommendationService.getRecommendations("u1", "media", 50, 6, undefined, {
      nowMs: NOON_LIMA,
    });
    expect(list[0].subcategoryId).toBe("sub-2");
    expect(list[0].reason).toContain("Está en tu plan de hoy.");
  });

  it("tasa de completado ordena a igualdad de resto", async () => {
    mocks.getCompletionBySubcategory.mockResolvedValue(
      new Map([
        ["sub-1", { completed: 0, total: 2 }],
        ["sub-2", { completed: 2, total: 2 }],
      ]),
    );
    const list = await ruleBasedRecommendationService.getRecommendations("u1", "media", 50, 6, undefined, {
      nowMs: NOON_LIMA,
    });
    expect(list[0].subcategoryId).toBe("sub-2");
  });

  it("de noche topa sugeridos a 25 min; de día no", async () => {    const night = await ruleBasedRecommendationService.getRecommendations("u1", "media", 50, 6, undefined, {
      nowMs: NIGHT_LIMA,
    });
    expect(night[0].suggestedMinutes).toBeLessThanOrEqual(25);
    const day = await ruleBasedRecommendationService.getRecommendations("u1", "media", 50, 6, undefined, {
      nowMs: NOON_LIMA,
    });
    expect(day[0].suggestedMinutes).toBe(50);
  });

  it("👎 excluye aunque sea la única (se respeta)", async () => {
    mocks.getFeedbackMap.mockResolvedValue(new Map([["sub-1", -1]]));
    const list = await ruleBasedRecommendationService.getRecommendations("u1", "media", 50, 6, undefined, {
      nowMs: NOON_LIMA,
    });
    expect(list.map((r) => r.subcategoryId)).toEqual(["sub-2"]);
  });

  it("👍 impulsa primero y expone feedback", async () => {
    mocks.getFeedbackMap.mockResolvedValue(new Map([["sub-2", 1]]));
    const list = await ruleBasedRecommendationService.getRecommendations("u1", "media", 50, 6, undefined, {
      nowMs: NOON_LIMA,
    });
    expect(list[0].subcategoryId).toBe("sub-2");
    expect(list[0].feedback).toBe(1);
    expect(list[0].reason).toContain("De tus favoritas.");
    expect(list[1].feedback).toBeNull();
  });
});
