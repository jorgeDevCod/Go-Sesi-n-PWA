import { beforeEach, describe, expect, it, vi } from "vitest";
import { processPlanningNotifications } from "./planning-notifications.service";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    listPendingPlanReminders: vi.fn(),
    markPlanReminderSent: vi.fn(),
    sendPushToUser: vi.fn(),
  },
}));

vi.mock("@/repositories/planning.repository", () => ({
  listPendingPlanReminders: mocks.listPendingPlanReminders,
  markPlanReminderSent: mocks.markPlanReminderSent,
}));

vi.mock("@/services/push/push.service", () => ({
  sendPushToUser: mocks.sendPushToUser,
}));

function reminder(overrides: Record<string, unknown> = {}) {
  return {
    id: "item-1",
    title: "Leer",
    remindAt: "12:00",
    plan: {
      userId: "user-1",
      date: new Date("2026-11-20T00:00:00.000Z"),
      timeZone: "America/Lima",
    },
    ...overrides,
  };
}

describe("processPlanningNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.markPlanReminderSent.mockResolvedValue({});
    mocks.sendPushToUser.mockResolvedValue({ sent: 1, failed: 0, pruned: 0 });
  });

  it("envía el recordatorio el mismo día local aunque la fecha se guarde en UTC", async () => {
    mocks.listPendingPlanReminders.mockResolvedValue([reminder()]);

    const summary = await processPlanningNotifications(
      new Date("2026-11-20T17:05:00.000Z"),
    );

    expect(summary.sent).toBe(1);
    expect(mocks.sendPushToUser).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ body: "Es hora de: Leer" }),
    );
    expect(mocks.markPlanReminderSent).toHaveBeenCalledWith(
      "item-1",
      expect.any(Date),
    );
  });

  it("no envía un recordatorio cuya hora aún no llegó", async () => {
    mocks.listPendingPlanReminders.mockResolvedValue([
      reminder({ remindAt: "12:10" }),
    ]);

    const summary = await processPlanningNotifications(
      new Date("2026-11-20T17:05:00.000Z"),
    );

    expect(summary.sent).toBe(0);
    expect(mocks.sendPushToUser).not.toHaveBeenCalled();
    expect(mocks.markPlanReminderSent).not.toHaveBeenCalled();
  });
});
