import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActivityPomodoroEditor } from "./ActivityPomodoroEditor";

vi.mock("@/features/recommendation/store/recommendation.store", () => ({
  useRecommendationPrefs: () => prefs,
}));

vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  setActivityPomodoroAction: vi.fn().mockResolvedValue({ success: true }),
}));

const prefs = {
  pomodoroPresets: {} as Record<string, unknown>,
  setPomodoroPreset: vi.fn(),
  removePomodoroPreset: vi.fn(),
};

const ITEMS = [
  {
    id: "sub-1",
    name: "React",
    icon: "Atom",
    color: "#06B6D4",
    order: 0,
    categoryId: "cat-1",
    complexity: "MEDIUM" as const,
    energyLevel: null,
    energyComplexity: null,
    pomodoroConfig: null,
  },
  {
    id: "sub-2",
    name: "Inglés",
    icon: "Languages",
    color: "#0EA5E9",
    order: 1,
    categoryId: "cat-1",
    complexity: "LOW" as const,
    energyLevel: null,
    energyComplexity: null,
    pomodoroConfig: null,
  },
];

describe("ActivityPomodoroEditor (compacto)", () => {
  it("lista las actividades y ofrece el nivel por defecto", () => {
    render(<ActivityPomodoroEditor items={ITEMS} categoryName="Aprender" />);
    expect(screen.getByRole("button", { name: /React/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Inglés/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Usar el nivel medio/ })).toBeInTheDocument();
  });

  it("cambia de actividad seleccionada", () => {
    render(<ActivityPomodoroEditor items={ITEMS} categoryName="Aprender" />);
    fireEvent.click(screen.getByRole("button", { name: /Inglés/ }));
    expect(screen.getByRole("button", { name: /Inglés/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
