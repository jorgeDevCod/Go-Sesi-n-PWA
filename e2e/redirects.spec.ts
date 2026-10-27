import { expect, test } from "@playwright/test";

test.describe("migración de URLs", () => {
  test("las rutas antiguas redirigen a las nuevas", async ({ request }) => {
    const cases = [
      ["/app/home", "/app/inicio"],
      ["/app/routine", "/app/personalizar"],
      ["/app/history", "/app/historial"],
      ["/app/trash", "/app/papelera"],
      ["/app/account", "/app/cuenta"],
      ["/app/session/recommend", "/app/recomendaciones"],
      ["/app/session/new", "/app/sesion/nueva"],
      ["/app/session", "/app/sesion"],
    ] as const;

    for (const [from, to] of cases) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(308);
      expect(response.headers()["location"], from).toContain(to);
    }
  });

  test("conserva los query params al redirigir", async ({ request }) => {
    const response = await request.get("/app/routine?tab=actividades&category=cat-1", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    const location = response.headers()["location"];
    expect(location).toContain("/app/personalizar");
    expect(location).toContain("tab=actividades");
    expect(location).toContain("category=cat-1");
  });
});
