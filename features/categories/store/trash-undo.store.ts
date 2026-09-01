import { create } from "zustand";

export type TrashUndoState = {
  open: boolean;
  kind: "category" | "subcategory";
  count: number;
  ids: string[];
  set: (payload: { kind: "category" | "subcategory"; count: number; ids: string[] }) => void;
  clear: () => void;
};

export const useTrashUndoStore = create<TrashUndoState>((set) => ({
  open: false,
  kind: "subcategory",
  count: 0,
  ids: [],
  set: ({ kind, count, ids }) => set({ open: true, kind, count, ids }),
  clear: () => set({ open: false, count: 0, ids: [] }),
}));
