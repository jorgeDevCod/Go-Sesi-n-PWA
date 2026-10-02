import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionWizard } from "./SessionWizard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/features/session/actions/session.actions", () => ({
  startSessionAction: vi.fn(),
}));

const SUBS = [
  { id: "sub-1", name: "React", icon: "Atom", color: "#06B6D4", complexity: "MEDIUM" as const },
  { id: "sub-2", name: "Inglés", icon: "Languages", color: "#0EA5E9", complexity: "LOW" as const },
];

describe("SessionWizard deep-link ?activity=", () => {
  it("preselecciona la actividad (no obliga a re-elegir)", () => {
    render(<SessionWizard categoryName="Aprender" subcategories={SUBS} startWithId="sub-2" />);
    expect(screen.getByText("Inglés")).toBeInTheDocument();
    expect(
      screen.queryByText("¿Qué actividad te gustaría hacer en Aprender?"),
    ).not.toBeInTheDocument();
  });

  it("id inválido cae a la lista", () => {
    render(<SessionWizard categoryName="Aprender" subcategories={SUBS} startWithId="nope" />);
    expect(
      screen.getByText("¿Qué actividad te gustaría hacer en Aprender?"),
    ).toBeInTheDocument();
  });

  it("sin id muestra la lista", () => {
    render(<SessionWizard categoryName="Aprender" subcategories={SUBS} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Inglés")).toBeInTheDocument();
  });
});
