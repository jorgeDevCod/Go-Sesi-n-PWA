import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PushSettings } from "./PushSettings";

vi.mock("@/features/push/actions/push.actions", () => ({
  savePushSubscriptionAction: vi.fn(),
  removePushSubscriptionAction: vi.fn(),
  sendTestPushAction: vi.fn(),
}));

describe("PushSettings", () => {
  it("sin clave VAPID muestra nota informativa sin romper", () => {
    render(<PushSettings />);
    expect(
      screen.getByText("Notificaciones no configuradas en este entorno."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Activar notificaciones" }),
    ).not.toBeInTheDocument();
  });
});
