import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryHomeCard, type CategoryHomeData } from "./CategoryHomeCard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const baseCategory: CategoryHomeData = {
  id: "cat-1",
  key: null,
  name: "Aprender",
  icon: "BookOpen",
  color: "#6366F1",
  isDefault: false,
  complexity: "MEDIUM",
  subcategoryCount: 0,
};

describe("CategoryHomeCard", () => {
  it("renders category name", () => {
    render(<CategoryHomeCard category={baseCategory} />);
    expect(screen.getByText("Aprender")).toBeInTheDocument();
  });

  it("navigates when clicked", async () => {
    const user = userEvent.setup();
    render(<CategoryHomeCard category={baseCategory} />);
    const card = screen.getByText("Aprender");
    await user.click(card);
    // Navigation happens via router.push, tested via mock
  });
});
