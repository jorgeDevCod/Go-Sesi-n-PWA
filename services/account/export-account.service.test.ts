import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportAccountData } from "./export-account.service";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    findUserById: vi.fn(),
    listCategoriesForUser: vi.fn(),
    listSubcategoriesByUser: vi.fn(),
    listSessionsForUser: vi.fn(),
    findActiveByUserId: vi.fn(),
    listPlansForUser: vi.fn(),
  },
}));

vi.mock("@/repositories/user.repository", () => ({ findUserById: mocks.findUserById }));
vi.mock("@/repositories/category.repository", () => ({
  listCategoriesForUser: mocks.listCategoriesForUser,
}));
vi.mock("@/repositories/subcategory.repository", () => ({
  listSubcategoriesByUser: mocks.listSubcategoriesByUser,
}));
vi.mock("@/repositories/focus-session.repository", () => ({
  listSessionsForUser: mocks.listSessionsForUser,
  findActiveByUserId: mocks.findActiveByUserId,
}));
vi.mock("@/repositories/planning.repository", () => ({
  listPlansForUser: mocks.listPlansForUser,
}));

describe("exportAccountData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUserById.mockResolvedValue({
      id: "u1",
      name: "Ana",
      email: "ana@example.com",
      passwordHash: "secreto",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    mocks.listCategoriesForUser.mockResolvedValue([]);
    mocks.listSubcategoriesByUser.mockResolvedValue([]);
    mocks.listSessionsForUser.mockResolvedValue([]);
    mocks.findActiveByUserId.mockResolvedValue(null);
    mocks.listPlansForUser.mockResolvedValue([]);
  });

  it("reúne perfil, categorías, sesiones y planes", async () => {
    mocks.listCategoriesForUser.mockResolvedValue([
      {
        name: "Aprender",
        icon: "Book",
        color: "#fff",
        order: 0,
        complexity: "MEDIUM",
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    ]);
    const data = await exportAccountData("u1");
    expect(data.user).toEqual({
      name: "Ana",
      email: "ana@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    expect(data.categories).toHaveLength(1);
    expect(data.exportedAt).toBeDefined();
  });

  it("nunca expone passwordHash ni secretos", async () => {
    const raw = JSON.stringify(await exportAccountData("u1"));
    expect(raw).not.toContain("secreto");
    expect(raw).not.toContain("passwordHash");
  });

  it("usuario inexistente lanza error", async () => {
    mocks.findUserById.mockResolvedValue(null);
    await expect(exportAccountData("nope")).rejects.toThrow("La cuenta no existe.");
  });
});
