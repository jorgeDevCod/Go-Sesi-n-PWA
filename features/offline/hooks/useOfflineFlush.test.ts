import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOfflineFlush } from "./useOfflineFlush";

const { mocks } = vi.hoisted(() => ({
  mocks: { flushOfflineQueue: vi.fn() },
}));

vi.mock("@/features/offline/queue-flush", () => ({ ...mocks }));

describe("useOfflineFlush", () => {
  it("drena al montar y al volver la red", async () => {
    mocks.flushOfflineQueue.mockResolvedValue({});
    const { unmount } = renderHook(() => useOfflineFlush());
    expect(mocks.flushOfflineQueue).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event("online"));
    expect(mocks.flushOfflineQueue).toHaveBeenCalledTimes(2);
    unmount();
  });
});
