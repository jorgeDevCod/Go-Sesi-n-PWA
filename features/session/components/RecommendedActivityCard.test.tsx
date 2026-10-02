import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RecommendedActivityCard } from "./RecommendedActivityCard";
import type { Recommendation } from "@/services/recommendation/recommendation.types";

function rec(): Recommendation {
  return {
    subcategoryId: "sub-1",
    subcategoryName: "React",
    subcategoryIcon: "Atom",
    subcategoryColor: "#06B6D4",
    categoryName: "Aprender",
    reason: "Hace 2 días que no la practicas.",
    suggestedMinutes: 25,
    complexity: "MEDIUM",
  };
}

describe("RecommendedActivityCard feedback", () => {
  it("vota 👍 y quita el voto al repetir", () => {
    const onFeedback = vi.fn();
    const { rerender } = render(
      <RecommendedActivityCard
        recommendation={rec()}
        highlighted
        isPending={false}
        onStart={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        feedback={null}
        onFeedback={onFeedback}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Me gusta esta recomendación" }));
    expect(onFeedback).toHaveBeenCalledWith(1);

    rerender(
      <RecommendedActivityCard
        recommendation={rec()}
        highlighted
        isPending={false}
        onStart={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        feedback={1}
        onFeedback={onFeedback}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Me gusta esta recomendación" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Me gusta esta recomendación" }));
    expect(onFeedback).toHaveBeenCalledWith(null);
  });

  it("sin onFeedback no muestra botones de voto", () => {
    render(
      <RecommendedActivityCard
        recommendation={rec()}
        highlighted={false}
        isPending={false}
        onStart={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Me gusta esta recomendación" }),
    ).not.toBeInTheDocument();
  });
});
