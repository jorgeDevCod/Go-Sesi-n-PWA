import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Complexity } from "@/lib/constants/default-subcategories";

export type HomeQuickItem = {
  subcategoryId: string;
  subcategoryName: string;
  subcategoryIcon: string;
  subcategoryColor: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  complexity: Complexity;
  order: number;
};

type HomeQuickStore = {
  items: HomeQuickItem[];
  add: (item: Omit<HomeQuickItem, "order">) => void;
  remove: (subcategoryId: string) => void;
  removeMany: (subcategoryIds: string[]) => void;
  isAdded: (subcategoryId: string) => boolean;
  reorder: (fromIndex: number, toIndex: number) => void;
  reset: () => void;
};

export const useHomeQuickStore = create<HomeQuickStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set((state) => {
          if (state.items.some((i) => i.subcategoryId === item.subcategoryId)) return state;
          return {
            items: [...state.items, { ...item, order: state.items.length }],
          };
        }),

      remove: (subcategoryId) =>
        set((state) => ({
          items: state.items
            .filter((i) => i.subcategoryId !== subcategoryId)
            .map((i, index) => ({ ...i, order: index })),
        })),

      removeMany: (subcategoryIds) =>
        set((state) => ({
          items: state.items
            .filter((i) => !subcategoryIds.includes(i.subcategoryId))
            .map((i, index) => ({ ...i, order: index })),
        })),

      isAdded: (subcategoryId) =>
        get().items.some((i) => i.subcategoryId === subcategoryId),

      reorder: (fromIndex, toIndex) =>
        set((state) => {
          const next = [...state.items];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return { items: next.map((i, index) => ({ ...i, order: index })) };
        }),

      reset: () => set({ items: [] }),
    }),
    {
      name: "gosession-home-quick",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
