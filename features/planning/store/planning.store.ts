import { create } from "zustand";
import type { PlanItem } from "@/features/planning/components/PlanningModal";

export type PlanningCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: { id: string; name: string; icon: string; color: string }[];
};

export type PlanningContext = {
  userName: string;
  categories: PlanningCategory[];
  planItems: PlanItem[];
};

type PlanningState = {
  isOpen: boolean;
  isPromptOpen: boolean;
  context: PlanningContext | null;
  planVersion: number;
  open: () => void;
  openPrompt: () => void;
  close: () => void;
  closePrompt: () => void;
  setContext: (context: PlanningContext) => void;
  bumpPlanVersion: () => void;
};

export const usePlanningStore = create<PlanningState>((set) => ({
  isOpen: false,
  isPromptOpen: false,
  context: null,
  planVersion: 0,
  open: () => set({ isOpen: true }),
  openPrompt: () => set({ isPromptOpen: true }),
  close: () => set({ isOpen: false, isPromptOpen: false, context: null }),
  closePrompt: () => set({ isPromptOpen: false }),
  setContext: (context) => set({ context }),
  bumpPlanVersion: () => set((state) => ({ planVersion: state.planVersion + 1 })),
}));
