import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dispatchQueuedAction,
  enqueueOffline,
  flushOfflineQueue,
  isOnline,
} from "./queue-flush";
import { createActionQueue, localStorageQueue } from "@/lib/action-queue";

const { mocks } = vi.hoisted(() => ({
  mocks: { saveFeedbackAction: vi.fn(), savePreferencesAction: vi.fn() },
}));

vi.mock("@/features/session/actions/recommendation.actions", () => ({
  saveFeedbackAction: mocks.saveFeedbackAction,
}));
vi.mock("@/features/preferences/actions/preferences.actions", () => ({
  savePreferencesAction: mocks.savePreferencesAction,
}));

describe("queue-flush", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("isOnline refleja navigator", () => {
    expect(isOnline()).toBe(true);
  });

  it("despacha feedback y prefs; rechaza tipos no encolables", async () => {
    mocks.saveFeedbackAction.mockResolvedValue({ success: true, value: 1 });
    mocks.savePreferencesAction.mockResolvedValue({ success: true });
    await dispatchQueuedAction({ type: "feedback", payload: { subcategoryId: "s", value: 1 } });
    await dispatchQueuedAction({ type: "prefs", payload: { dontAskAgain: true } });
    await expect(dispatchQueuedAction({ type: "pause", payload: {} })).rejects.toThrow(
      "no encolable",
    );
  });

  it("fallo del servidor lanza para reintentar", async () => {
    mocks.saveFeedbackAction.mockResolvedValue({ success: false, error: "x" });
    await expect(
      dispatchQueuedAction({ type: "feedback", payload: {} }),
    ).rejects.toThrow("x");
  });

  it("enqueue + flush extremo a extremo", async () => {
    mocks.savePreferencesAction.mockResolvedValue({ success: true });
    enqueueOffline("prefs", { dontAskAgain: true }, "prefs");
    expect(
      createActionQueue({ storage: localStorageQueue("gosession-offline-queue") }).pending(),
    ).toHaveLength(1);
    const results = await flushOfflineQueue();
    expect(results).toEqual({ prefs: { status: "ok" } });
    expect(
      createActionQueue({ storage: localStorageQueue("gosession-offline-queue") }).pending(),
    ).toHaveLength(0);
  });
});
