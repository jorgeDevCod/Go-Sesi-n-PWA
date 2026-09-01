import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./AppShell";

const mockBack = vi.fn();

let mockPathname = "/app/subcategories";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ back: mockBack, push: vi.fn() }),
}));

vi.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => null,
}));

vi.mock("@/components/ui/Logo", () => ({
  Logo: () => null,
}));

vi.mock("@/features/auth/actions/logout.action", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("@/features/planning/components/PlanningManager", () => ({
  PlanningManager: () => null,
}));

vi.mock("@/features/planning/components/PlanContinuePrompt", () => ({
  PlanContinuePrompt: () => null,
}));

vi.mock("@/features/planning/actions/planning.actions", () => ({
  getTodayPlanAction: vi.fn().mockResolvedValue({ success: true, plan: null }),
  saveTodayPlanAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/features/session/components/ResumeSessionPrompt", () => ({
  ResumeSessionPrompt: () => null,
}));

vi.mock("@/features/categories/components/TrashUndoModal", () => ({
  TrashUndoModal: () => null,
}));

vi.mock("@/features/session/store/session.store", () => ({
  useSessionStore: {
    persist: { rehydrate: vi.fn() },
    getState: vi.fn(() => ({ session: null, clearSession: vi.fn() })),
    setState: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
}));

import { usePlanningStore } from "@/features/planning/store/planning.store";

describe("AppShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlanningStore.setState({ isOpen: false, isPromptOpen: false, context: null, planVersion: 0 });
  });

  it("renders children", () => {
    mockPathname = "/app/subcategories";
    render(
      <AppShell userName="Test">
        <p>Contenido</p>
      </AppShell>,
    );
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("shows back button when not on home", () => {
    mockPathname = "/app/subcategories";
    render(
      <AppShell userName="Test">
        <p>test</p>
      </AppShell>,
    );
    expect(screen.getByLabelText("Volver")).toBeInTheDocument();
  });

  it("hides back button on home", () => {
    mockPathname = "/app/home";
    render(
      <AppShell userName="Test">
        <p>test</p>
      </AppShell>,
    );
    expect(screen.queryByLabelText("Volver")).not.toBeInTheDocument();
  });

  it("calls router.back() when clicking back button", async () => {
    mockPathname = "/app/subcategories";
    Object.defineProperty(window, "history", {
      value: { length: 3 },
      writable: true,
    });
    const user = userEvent.setup();
    render(
      <AppShell userName="Test">
        <p>test</p>
      </AppShell>,
    );
    await user.click(screen.getByLabelText("Volver"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("opens the planning modal from the header button", async () => {
    mockPathname = "/app/subcategories";
    const user = userEvent.setup();
    render(
      <AppShell userName="Test">
        <p>test</p>
      </AppShell>,
    );
    const button = screen.getByRole("button", { name: "Editar planificación del día" });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(usePlanningStore.getState().isOpen).toBe(true);
  });
});
