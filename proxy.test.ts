import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";
import { isPublicApiPath } from "./lib/public-api-paths";

describe("isPublicApiPath", () => {
  it("deja públicas las rutas de Auth.js", () => {
    expect(isPublicApiPath("/api/auth/session")).toBe(true);
    expect(isPublicApiPath("/api/auth/csrf")).toBe(true);
    expect(isPublicApiPath("/api/auth/providers")).toBe(true);
    expect(isPublicApiPath("/api/auth/signin")).toBe(true);
    expect(isPublicApiPath("/api/auth/callback/credentials")).toBe(true);
  });

  it("protege el resto de /api y /app", () => {
    expect(isPublicApiPath("/api/other")).toBe(false);
    expect(isPublicApiPath("/api/authx")).toBe(false);
    expect(isPublicApiPath("/app/inicio")).toBe(false);
    expect(isPublicApiPath("/login")).toBe(false);
  });
});

describe("migración de URLs", () => {
  it("redirige de forma permanente las rutas antiguas", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const bySource = new Map(redirects.map((redirect) => [redirect.source, redirect]));
    expect(bySource.get("/app/home")).toMatchObject({
      destination: "/app/inicio",
      permanent: true,
    });
    expect(bySource.get("/app/routine")).toMatchObject({
      destination: "/app/personalizar",
      permanent: true,
    });
    expect(bySource.get("/app/session/new")).toMatchObject({
      destination: "/app/sesion/nueva",
      permanent: true,
    });
    expect(bySource.get("/app/session")).toMatchObject({
      destination: "/app/sesion",
      permanent: true,
    });
  });
});

describe("security headers", () => {
  it("expone cabeceras no rompibles en todas las rutas", async () => {
    const headers = await nextConfig.headers?.();
    const global = headers?.find((h) => h.source === "/:path*");
    const keys = new Map((global?.headers ?? []).map((h) => [h.key, h.value]));
    expect(keys.get("X-Content-Type-Options")).toBe("nosniff");
    expect(keys.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(keys.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(keys.get("Permissions-Policy")).toContain("camera=()");
  });
});
