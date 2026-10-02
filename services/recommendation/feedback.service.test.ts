import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveFeedbackForUser } from "./feedback.service";
import {
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "@/services/categories/subcategory.errors";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    findSubcategoryById: vi.fn(),
    setFeedback: vi.fn(),
    clearFeedback: vi.fn(),
  },
}));

vi.mock("@/repositories/subcategory.repository", () => ({
  findSubcategoryById: mocks.findSubcategoryById,
}));
vi.mock("@/repositories/recommendation-feedback.repository", () => ({
  getFeedbackMap: vi.fn(),
  setFeedback: mocks.setFeedback,
  clearFeedback: mocks.clearFeedback,
}));

describe("feedback.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findSubcategoryById.mockResolvedValue({ id: "sub-1", userId: "u1" });
  });

  it("guarda 👍/👎 en actividad propia", async () => {
    mocks.setFeedback.mockResolvedValue({ id: "f1" });
    await expect(saveFeedbackForUser("u1", "sub-1", 1)).resolves.toBe(1);
    expect(mocks.setFeedback).toHaveBeenCalledWith("u1", "sub-1", 1);
  });

  it("null limpia el feedback", async () => {
    mocks.clearFeedback.mockResolvedValue({ count: 1 });
    await expect(saveFeedbackForUser("u1", "sub-1", null)).resolves.toBeNull();
    expect(mocks.clearFeedback).toHaveBeenCalledWith("u1", "sub-1");
  });

  it("ajena o inexistente lanza sin escribir", async () => {
    mocks.findSubcategoryById.mockResolvedValueOnce({ id: "sub-1", userId: "otro" });
    await expect(saveFeedbackForUser("u1", "sub-1", 1)).rejects.toBeInstanceOf(
      SubcategoryForbiddenError,
    );
    mocks.findSubcategoryById.mockResolvedValueOnce(null);
    await expect(saveFeedbackForUser("u1", "sub-1", -1)).rejects.toBeInstanceOf(
      SubcategoryNotFoundError,
    );
    expect(mocks.setFeedback).not.toHaveBeenCalled();
  });

  it("valor inválido lanza", async () => {
    await expect(saveFeedbackForUser("u1", "sub-1", 0 as never)).rejects.toThrow(
      "Feedback inválido.",
    );
  });
});
