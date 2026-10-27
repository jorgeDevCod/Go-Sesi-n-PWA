import { describe, expect, it } from "vitest";
import { AUTH_ROUTES, LEGACY_ROUTES, ROUTES } from "./routes";

describe("rutas canónicas", () => {
  it("expone las rutas principales de la app en español", () => {
    expect(ROUTES.home).toBe("/app/inicio");
    expect(ROUTES.customize).toBe("/app/personalizar");
    expect(ROUTES.history).toBe("/app/historial");
    expect(ROUTES.trash).toBe("/app/papelera");
    expect(ROUTES.account).toBe("/app/cuenta");
    expect(ROUTES.recommend).toBe("/app/recomendaciones");
    expect(ROUTES.session).toBe("/app/sesion");
  });

  it("construye actividades y nueva sesión con query params en español", () => {
    expect(ROUTES.activities()).toBe("/app/personalizar?tab=actividades");
    expect(ROUTES.activities("cat-1")).toBe(
      "/app/personalizar?tab=actividades&categoria=cat-1",
    );
    expect(ROUTES.sessionNew()).toBe("/app/sesion/nueva");
    expect(ROUTES.sessionNew("cat-1", "sub-1")).toBe(
      "/app/sesion/nueva?categoria=cat-1&actividad=sub-1",
    );
  });

  it("mantiene las rutas de auth actuales", () => {
    expect(AUTH_ROUTES.login).toBe("/login");
    expect(AUTH_ROUTES.register).toBe("/register");
    expect(AUTH_ROUTES.forgotPassword).toBe("/forgot-password");
    expect(AUTH_ROUTES.resetPassword("tok")).toBe("/reset-password/tok");
  });

  it("documenta las rutas antiguas para las redirecciones", () => {
    expect(LEGACY_ROUTES.home).toBe("/app/home");
    expect(LEGACY_ROUTES.sessionNew).toBe("/app/session/new");
  });
});
