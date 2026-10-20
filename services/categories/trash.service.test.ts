import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  enforceTrashMaxItems,
  listTrash,
  permanentlyDeleteTrashItems,
  purgeExpiredTrashItems,
} from "./trash.service";

const { prismaMocks, categoryRepoMocks, subcategoryRepoMocks } = vi.hoisted(() => ({
  prismaMocks: {
    $transaction: vi.fn(),
    subcategoryDeleteMany: vi.fn(),
    subcategoryFindMany: vi.fn(),
    categoryDeleteMany: vi.fn(),
    categoryFindMany: vi.fn(),
    subcategoryDelete: vi.fn(),
    categoryDelete: vi.fn(),
  },
  categoryRepoMocks: {
    countDeletedForUser: vi.fn(),
    findCategoryById: vi.fn(),
    oldestDeletedCategoryIds: vi.fn(),
  },
  subcategoryRepoMocks: {
    findSubcategoryById: vi.fn(),
    listDeletedSubcategoriesForCategory: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: prismaMocks.$transaction,
    subcategory: {
      delete: prismaMocks.subcategoryDelete,
      deleteMany: prismaMocks.subcategoryDeleteMany,
      findMany: prismaMocks.subcategoryFindMany,
    },
    category: {
      delete: prismaMocks.categoryDelete,
      deleteMany: prismaMocks.categoryDeleteMany,
      findMany: prismaMocks.categoryFindMany,
    },
  },
}));

vi.mock("@/repositories/category.repository", () => ({
  countDeletedForUser: categoryRepoMocks.countDeletedForUser,
  findCategoryById: categoryRepoMocks.findCategoryById,
  oldestDeletedCategoryIds: categoryRepoMocks.oldestDeletedCategoryIds,
  restoreCategory: vi.fn(),
  softDeleteCategory: vi.fn(),
}));

vi.mock("@/repositories/subcategory.repository", () => ({
  findSubcategoryById: subcategoryRepoMocks.findSubcategoryById,
  listDeletedSubcategoriesForCategory: subcategoryRepoMocks.listDeletedSubcategoriesForCategory,
  restoreSubcategory: vi.fn(),
  softDeleteSubcategory: vi.fn(),
}));

describe("purgeExpiredTrashItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("purga con corte de 15 días", async () => {
    await purgeExpiredTrashItems("u1", new Date("2026-10-01T00:00:00.000Z"));
    const cutoff = new Date("2026-09-16T00:00:00.000Z");
    expect(prismaMocks.subcategoryDeleteMany).toHaveBeenCalledWith({
      where: { userId: "u1", deletedAt: { not: null, lt: cutoff } },
    });
    expect(prismaMocks.categoryDeleteMany).toHaveBeenCalledWith({
      where: { userId: "u1", deletedAt: { not: null, lt: cutoff } },
    });
    expect(prismaMocks.$transaction).toHaveBeenCalledTimes(1);
  });
});

describe("listTrash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("purga lo vencido antes de listar (GC perezoso)", async () => {
    prismaMocks.categoryFindMany.mockResolvedValue([]);
    prismaMocks.subcategoryFindMany.mockResolvedValue([]);
    await listTrash("u1");
    expect(prismaMocks.subcategoryDeleteMany).toHaveBeenCalled();
    expect(prismaMocks.subcategoryFindMany).toHaveBeenCalled();
    expect(
      prismaMocks.subcategoryDeleteMany.mock.invocationCallOrder[0],
    ).toBeLessThan(prismaMocks.subcategoryFindMany.mock.invocationCallOrder[0]);
  });
});

describe("enforceTrashMaxItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sin exceso no borra nada", async () => {
    categoryRepoMocks.countDeletedForUser.mockResolvedValue([10, 5]);
    await enforceTrashMaxItems("u1");
    expect(prismaMocks.subcategoryDeleteMany).not.toHaveBeenCalled();
    expect(prismaMocks.categoryDeleteMany).not.toHaveBeenCalled();
  });

  it("con exceso purga primero las subcategorías más antiguas", async () => {
    categoryRepoMocks.countDeletedForUser.mockResolvedValue([40, 20]);
    const ten = Array.from({ length: 10 }, (_, i) => ({ id: `s${i}` }));
    prismaMocks.subcategoryFindMany.mockResolvedValue(ten);
    categoryRepoMocks.oldestDeletedCategoryIds.mockResolvedValue([]);
    await enforceTrashMaxItems("u1");
    expect(prismaMocks.subcategoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 }),
    );
    expect(prismaMocks.subcategoryDeleteMany).toHaveBeenCalledWith({
      where: { id: { in: ten.map((s) => s.id) } },
    });
    expect(prismaMocks.categoryDeleteMany).not.toHaveBeenCalled();
  });
});

describe("permanentlyDeleteTrashItems (ownership)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subcategoryRepoMocks.listDeletedSubcategoriesForCategory.mockResolvedValue([]);
  });

  it("borra el item si es del usuario", async () => {
    subcategoryRepoMocks.findSubcategoryById.mockResolvedValue({ id: "s1", userId: "u1" });
    const result = await permanentlyDeleteTrashItems(
      [{ kind: "subcategory", id: "s1" }],
      "u1",
    );
    expect(prismaMocks.subcategoryDelete).toHaveBeenCalledWith({ where: { id: "s1" } });
    expect(result.failed).toEqual([]);
  });

  it("NO borra una actividad de otro usuario", async () => {
    subcategoryRepoMocks.findSubcategoryById.mockResolvedValue({ id: "s1", userId: "otro" });
    const result = await permanentlyDeleteTrashItems(
      [{ kind: "subcategory", id: "s1" }],
      "u1",
    );
    expect(prismaMocks.subcategoryDelete).not.toHaveBeenCalled();
    expect(result.failed).toEqual([]);
  });

  it("NO borra una categoría de otro usuario", async () => {
    categoryRepoMocks.findCategoryById.mockResolvedValue({ id: "c1", userId: "otro" });
    await permanentlyDeleteTrashItems([{ kind: "category", id: "c1" }], "u1");
    expect(prismaMocks.categoryDelete).not.toHaveBeenCalled();
    expect(prismaMocks.subcategoryDeleteMany).not.toHaveBeenCalled();
  });
});
