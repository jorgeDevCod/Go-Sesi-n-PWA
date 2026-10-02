import { expect, test } from "@playwright/test";

/**
 * Smoke E2E sin DB: landing, login y protección del proxy.
 * El flujo con sesión (registro → plan → sesión → historial) queda para
 * cuando haya seed/DB dedicada de E2E.
 */
test("landing muestra la marca", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Go Sesión|Reserva tu espacio/i).first()).toBeVisible();
});

test("login muestra el formulario", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/correo/i)).toBeVisible();
  await expect(page.getByLabel(/contraseña/i)).toBeVisible();
});

test("sin sesión /app/home redirige a /login (proxy)", async ({ page }) => {
  await page.goto("/app/home");
  await expect(page).toHaveURL(/\/login/);
});

test("tabs de la landing saltan a cada sección", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Personalizar" }).first().click();
  await expect(page).toHaveURL(/#personalizar/);
  await expect(
    page.getByRole("heading", { name: "Todo se adapta a ti" }),
  ).toBeVisible();
});
