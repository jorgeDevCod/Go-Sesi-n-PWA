import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PushNotConfiguredError,
  removePushSubscriptionForUser,
  savePushSubscriptionForUser,
  sendTestPushToUser,
} from "./push.service";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    listPushSubscriptionsForUser: vi.fn(),
    upsertPushSubscription: vi.fn(),
    deletePushSubscription: vi.fn(),
    deletePushSubscriptionByEndpoint: vi.fn(),
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

vi.mock("@/repositories/push-subscription.repository", () => ({ ...mocks }));

vi.mock("web-push", () => ({
  __esModule: true,
  default: {
    setVapidDetails: mocks.setVapidDetails,
    sendNotification: mocks.sendNotification,
  },
}));

const KEYS = { p256dh: "p256", auth: "auth" };

describe("push.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "pub";
    process.env.VAPID_PRIVATE_KEY = "priv";
  });

  it("sin claves VAPID lanza PushNotConfiguredError", async () => {
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    await expect(sendTestPushToUser("u1")).rejects.toBeInstanceOf(PushNotConfiguredError);
    expect(mocks.sendNotification).not.toHaveBeenCalled();
  });

  it("endpoint no https se rechaza sin guardar", async () => {
    await expect(savePushSubscriptionForUser("u1", "http://x", KEYS)).rejects.toThrow(
      "Suscripción inválida.",
    );
    expect(mocks.upsertPushSubscription).not.toHaveBeenCalled();
  });

  it("guarda y elimina suscripciones", async () => {
    mocks.upsertPushSubscription.mockResolvedValue({ id: "s1" });
    mocks.deletePushSubscription.mockResolvedValue({ count: 1 });
    await savePushSubscriptionForUser("u1", "https://push/x", KEYS);
    expect(mocks.upsertPushSubscription).toHaveBeenCalledWith("u1", "https://push/x", KEYS);
    await removePushSubscriptionForUser("u1", "https://push/x");
    expect(mocks.deletePushSubscription).toHaveBeenCalledWith("u1", "https://push/x");
  });

  it("envía, poda vencidas (410) y cuenta fallos", async () => {
    mocks.listPushSubscriptionsForUser.mockResolvedValue([
      { endpoint: "https://push/ok", keys: KEYS },
      { endpoint: "https://push/gone", keys: KEYS },
      { endpoint: "https://push/err", keys: KEYS },
      { endpoint: "https://push/rotas", keys: { mal: 1 } },
    ]);
    mocks.sendNotification
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce({ statusCode: 410 })
      .mockRejectedValueOnce({ statusCode: 500 });
    mocks.deletePushSubscriptionByEndpoint.mockResolvedValue({ count: 1 });
    const summary = await sendTestPushToUser("u1");
    expect(summary).toEqual({ sent: 1, failed: 2, pruned: 1 });
    expect(mocks.deletePushSubscriptionByEndpoint).toHaveBeenCalledWith("https://push/gone");
  });
});
