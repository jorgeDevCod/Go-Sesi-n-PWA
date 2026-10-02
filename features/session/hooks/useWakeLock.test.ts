import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useWakeLock } from "./useWakeLock";

type MockLock = {
  release: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
};

function mockWakeLock() {
  const locks: MockLock[] = [];
  const request = vi.fn(async () => {
    const lock: MockLock = { release: vi.fn(async () => {}), addEventListener: vi.fn() };
    locks.push(lock);
    return lock;
  });
  (navigator as unknown as Record<string, unknown>).wakeLock = { request };
  return { request, locks };
}

describe("useWakeLock", () => {
  beforeEach(() => {
    // jsdom no trae wakeLock: cada test define su soporte.
  });

  afterEach(() => {
    (navigator as unknown as Record<string, unknown>).wakeLock = undefined;
  });

  it("adquiere el lock cuando hay sesión activa", async () => {
    const { request } = mockWakeLock();
    renderHook(() => useWakeLock(true));
    await act(async () => {});
    expect(request).toHaveBeenCalledWith("screen");
  });

  it("no hace nada sin soporte ni con sesión inactiva", async () => {
    renderHook(() => useWakeLock(true));
    await act(async () => {});
    const { request } = mockWakeLock();
    renderHook(() => useWakeLock(false));
    await act(async () => {});
    expect(request).not.toHaveBeenCalled();
  });

  it("libera al desmontar", async () => {
    const { locks } = mockWakeLock();
    const { unmount } = renderHook(() => useWakeLock(true));
    await act(async () => {});
    expect(locks).toHaveLength(1);
    unmount();
    expect(locks[0].release).toHaveBeenCalled();
  });
});
