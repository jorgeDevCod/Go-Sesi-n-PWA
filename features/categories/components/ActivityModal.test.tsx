import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ActivityModal, type ActivityModalInitial } from "./ActivityModal";
import { updateSubcategoryAction } from "@/features/categories/actions/subcategory.actions";

vi.setConfig({ testTimeout: 20_000 });

vi.mock("@/features/recommendation/store/recommendation.store", () => ({
  useRecommendationPrefs: () => prefs,
}));

vi.mock("@/features/categories/actions/subcategory.actions", () => ({
  createSubcategoryAction: vi.fn(),
  updateSubcategoryAction: vi.fn().mockResolvedValue({ success: true }),
}));

const prefs = {
  pomodoroPresets: {} as Record<string, unknown>,
  setPomodoroPreset: vi.fn(),
};

const baseConfig = {
  focusMin: 50,
  breakMin: 10,
  cycles: 5,
  autoStart: false,
  longBreakMin: 0,
  skipBreaks: false,
};

const INITIAL: ActivityModalInitial = {
  id: "sub-1",
  name: "React",
  icon: "Atom",
  color: "#06B6D4",
  complexity: "MEDIUM",
  energyLevel: null,
  energyComplexity: null,
  pomodoroConfig: null,
};

function renderModal(initial = INITIAL) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  const props = {
    categoryId: "cat-1",
    categoryName: "Aprender",
    initial,
    onSaved,
    onClose,
  };
  const { rerender } = render(<ActivityModal {...props} open={false} />);
  rerender(<ActivityModal {...props} open />);
  return { onSaved, onClose };
}

describe("ActivityModal · programación pomodoro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el editor compacto y el nivel recomendado por dificultad", () => {
    renderModal();
    expect(screen.getByText("Programación")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usar el nivel medio" })).toBeInTheDocument();
    expect(screen.getAllByText(/nivel medio/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Aumentar Foco" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aumentar Descanso" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aumentar Ciclos" })).toBeInTheDocument();
  });

  it("la dificultad cambia el nivel y la programación se guarda como predefinida", async () => {
    const { onSaved } = renderModal();

    fireEvent.click(screen.getByRole("button", { name: /Alta/ }));
    expect(screen.getByRole("button", { name: "Usar el nivel intenso" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aumentar Ciclos" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(updateSubcategoryAction).toHaveBeenCalled());
    expect(updateSubcategoryAction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sub-1",
        complexity: "HIGH",
        pomodoroConfig: expect.objectContaining({ cycles: 3 }),
      }),
    );
    expect(prefs.setPomodoroPreset).toHaveBeenCalledWith(
      "intenso",
      expect.objectContaining({ cycles: 3 }),
    );
    expect(onSaved).toHaveBeenCalled();
  });

  it("permite volver al nivel predefinido sin cronómetro propio", async () => {
    renderModal({ ...INITIAL, pomodoroConfig: baseConfig });
    fireEvent.click(screen.getByRole("button", { name: "Usar el nivel medio" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(updateSubcategoryAction).toHaveBeenCalledWith(
        expect.objectContaining({ pomodoroConfig: null }),
      ),
    );
    expect(prefs.setPomodoroPreset).not.toHaveBeenCalled();
  });
});
