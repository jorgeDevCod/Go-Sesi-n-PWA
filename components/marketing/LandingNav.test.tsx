import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LANDING_TABS, LandingNav } from "./LandingNav";

type ObserverCallback = (entries: { isIntersecting: boolean; target: { id: string } }[]) => void;

function mockIntersectionObserver() {
  const callbacks: ObserverCallback[] = [];
  const observe = vi.fn();
  const disconnect = vi.fn();
  function FakeObserver(cb: ObserverCallback) {
    callbacks.push(cb);
    return { observe, disconnect };
  }
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  return { callbacks, observe, disconnect };
}

describe("LandingNav", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("muestra los 6 tabs con sus anclas", () => {
    render(<LandingNav variant="desktop" />);
    expect(LANDING_TABS).toHaveLength(6);
    for (const tab of LANDING_TABS) {
      expect(screen.getByRole("link", { name: tab.label })).toHaveAttribute(
        "href",
        `#${tab.id}`,
      );
    }
  });

  it("clic hace scroll suave a la sección y fija el hash", () => {
    const scrollIntoView = vi.fn();
    const section = document.createElement("section");
    section.id = "personalizar";
    section.scrollIntoView = scrollIntoView;
    document.body.appendChild(section);

    render(<LandingNav variant="desktop" />);
    fireEvent.click(screen.getByRole("link", { name: "Personalizar" }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(window.location.hash).toBe("#personalizar");
  });

  it("marca el tab de la sección visible", () => {
    const { callbacks } = mockIntersectionObserver();
    const section = document.createElement("section");
    section.id = "planificar";
    document.body.appendChild(section);

    render(<LandingNav variant="mobile" />);
    expect(
      screen.getByRole("link", { name: "Planificar" }),
    ).not.toHaveAttribute("aria-current");
    act(() => {
      callbacks[0]([{ isIntersecting: true, target: { id: "planificar" } }]);
    });
    expect(screen.getByRole("link", { name: "Planificar" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
