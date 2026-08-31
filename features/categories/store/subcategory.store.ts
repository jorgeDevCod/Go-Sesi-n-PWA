import { create } from "zustand";
import { reorderIds } from "@/lib/order";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { EnergyLevel } from "@/services/recommendation/energy-level";

export type SubcategoryItem = {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  categoryId: string;
  complexity: Complexity;
  energyLevel?: EnergyLevel | null;
  energyComplexity?: Complexity | null;
};

type SubcategoryStore = {
  itemsByCategory: Record<string, SubcategoryItem[]>;
  setItems: (categoryId: string, items: SubcategoryItem[]) => void;
  addItem: (item: SubcategoryItem) => void;
  updateItem: (
    categoryId: string,
    id: string,
    patch: Partial<Pick<SubcategoryItem, "name" | "icon" | "color" | "complexity">>,
  ) => void;
  removeItem: (categoryId: string, id: string) => void;
  reorder: (categoryId: string, fromIndex: number, toIndex: number) => string[];
};

export const useSubcategoryStore = create<SubcategoryStore>((set, get) => ({
  itemsByCategory: {},

  setItems: (categoryId, items) =>
    set((state) => ({
      itemsByCategory: { ...state.itemsByCategory, [categoryId]: items },
    })),

  addItem: (item) =>
    set((state) => ({
      itemsByCategory: {
        ...state.itemsByCategory,
        [item.categoryId]: [...(state.itemsByCategory[item.categoryId] ?? []), item],
      },
    })),

  updateItem: (categoryId, id, patch) =>
    set((state) => ({
      itemsByCategory: {
        ...state.itemsByCategory,
        [categoryId]: (state.itemsByCategory[categoryId] ?? []).map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      },
    })),

  removeItem: (categoryId, id) =>
    set((state) => ({
      itemsByCategory: {
        ...state.itemsByCategory,
        [categoryId]: (state.itemsByCategory[categoryId] ?? []).filter(
          (item) => item.id !== id,
        ),
      },
    })),

  reorder: (categoryId, fromIndex, toIndex) => {
    const current = get().itemsByCategory[categoryId] ?? [];
    const ids = current.map((item) => item.id);
    const reorderedIds = reorderIds(ids, fromIndex, toIndex);

    const byId = new Map(current.map((item) => [item.id, item]));
    const reorderedItems = reorderedIds.map((id, index) => ({
      ...byId.get(id)!,
      order: index,
    }));

    set((state) => ({
      itemsByCategory: { ...state.itemsByCategory, [categoryId]: reorderedItems },
    }));

    return reorderedIds;
  },
}));
