import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import {
  cancelScheduledNotification,
  completionTag,
  completionTargetMs,
  scheduleCompletionNotification,
  supportsScheduledNotifications,
} from "./scheduled-notification";

const MIN = 60_000;
const T0 = new Date("2026-10-01T10:00:00.000Z").getTime();

function mockScheduledSupport() {
  const showNotification: Mock<
    (title: string, options?: Record<string, unknown>) => Promise<void>
  > = vi.fn(async () => {});
  const getNotifications: Mock<(filter?: { tag: string }) => Promise<{ close: () => void }[]>> =
    vi.fn(async () => []);
  const registration = { showNotification, getNotifications };
  Object.defineProperty(navigator, "serviceWorker", {
    value: { ready: Promise.resolve(registration) },
    configurable: true,
  });
  class MockNotification {
    static permission: NotificationPermission = "granted";
  }
  (MockNotification.prototype as Record<string, unknown>).showTrigger = {};
  vi.stubGlobal("Notification", MockNotification);
  vi.stubGlobal("TimestampTrigger", vi.fn(function (this: unknown, time: number) {
    (this as { time: number }).time = time;
  }));
  return { showNotification, getNotifications };
}

describe("scheduled-notification", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("target: activa suma inicio+pausas+plan; pausada o vencida → null", () => {
    expect(
      completionTargetMs({ startedAtMs: T0, pausedMs: 0, pausedAtMs: null, plannedMinutes: 25 }, T0),
    ).toBe(T0 + 25 * MIN);
    expect(
      completionTargetMs({ startedAtMs: T0, pausedMs: 0, pausedAtMs: T0 + MIN, plannedMinutes: 25 }, T0),
    ).toBeNull();
    expect(
      completionTargetMs({ startedAtMs: T0, pausedMs: 0, pausedAtMs: null, plannedMinutes: 25 }, T0 + 60 * MIN),
    ).toBeNull();
  });

  it("tag único por sesión", () => {
    expect(completionTag("abc")).toBe("gosession-done-abc");
  });

  it("sin soporte no programa", async () => {
    expect(supportsScheduledNotifications()).toBe(false);
    expect(
      await scheduleCompletionNotification({ sessionId: "s", title: "t", body: "b", targetMs: T0 }),
    ).toBe(false);
  });

  it("con soporte programa con trigger y tag, y cancela", async () => {
    const { showNotification, getNotifications } = mockScheduledSupport();
    expect(supportsScheduledNotifications()).toBe(true);
    const ok = await scheduleCompletionNotification({
      sessionId: "s1",
      title: "React",
      body: "Terminó",
      targetMs: Date.now() + 25 * MIN,
    });
    expect(ok).toBe(true);
    expect(showNotification).toHaveBeenCalledTimes(1);
    const [title, options] = showNotification.mock.calls[0];
    expect(title).toBe("React");
    expect(options?.tag).toBe("gosession-done-s1");

    const close = vi.fn();
    getNotifications.mockResolvedValue([{ close }]);
    await cancelScheduledNotification("s1");
    expect(getNotifications).toHaveBeenCalledWith({ tag: "gosession-done-s1" });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
