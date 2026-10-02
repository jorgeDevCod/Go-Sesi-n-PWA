import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("permite hasta maxAttempts dentro de la ventana", () => {
    const limiter = createRateLimiter({ maxAttempts: 3, windowMs: 60_000 });
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(true);
    const blocked = limiter.check("ip");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("aísla claves distintas", () => {
    const limiter = createRateLimiter({ maxAttempts: 1, windowMs: 60_000 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("la ventana expirada vuelve a permitir", () => {
    const now = vi.fn(() => 1_000);
    const limiter = createRateLimiter({ maxAttempts: 1, windowMs: 60_000, now });
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(false);
    now.mockReturnValue(1_000 + 61_000);
    expect(limiter.check("ip").allowed).toBe(true);
  });

  it("reset libera la clave", () => {
    const limiter = createRateLimiter({ maxAttempts: 1, windowMs: 60_000 });
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(false);
    limiter.reset("ip");
    expect(limiter.check("ip").allowed).toBe(true);
  });

  it("isBlocked no consume intentos", () => {
    const limiter = createRateLimiter({ maxAttempts: 1, windowMs: 60_000 });
    expect(limiter.isBlocked("ip").allowed).toBe(true);
    expect(limiter.isBlocked("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.isBlocked("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(false);
    expect(limiter.isBlocked("ip").allowed).toBe(false);
  });
});
