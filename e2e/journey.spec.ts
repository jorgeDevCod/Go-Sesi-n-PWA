import { expect, test } from "@playwright/test";

/**
 * Journey con usuario aislado: registro → primera sesión → fin → historial.
 * Usa datos reales (DB dev): el email es único por corrida, sin fixtures.
 */
test("registro → sesión → fin → historial", async ({ page }) => {
  test.setTimeout(180_000);
  page.on("dialog", (dialog) => void dialog.accept());

  const stamp = Date.now();
  const email = `e2e-${stamp}@example.com`;

  // 1. Registro.
  await page.goto("/register");
  await page.getByLabel("Nombre Completo").fill("E2E");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill("E2e-1234!x");
  await page.getByLabel("Confirma tu contraseña").fill("E2e-1234!x");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/app\/home/, { timeout: 30_000 });

  // 2. Onboarding: bienvenida → ánimo.
  await page.getByRole("dialog", { name: "Bienvenida" }).waitFor({ timeout: 15_000 });
  await page.getByRole("button", { name: /¡Estoy listo! Empecemos/ }).click();
  await page.getByRole("dialog", { name: /¿Cómo te sientes hoy/ }).waitFor({ timeout: 15_000 });
  await page.getByRole("button", { name: "Ir a mi espacio" }).click();

  // 3. Recomendación → empezar la primera.
  await page.goto("/app/session/recommend");
  const startButton = page.getByRole("button", { name: "Empezar", exact: true }).first();
  await expect(startButton).toBeVisible({ timeout: 30_000 });
  await startButton.click();

  // 4. Confirmar sin cuenta regresiva y arrancar.
  await page.getByRole("button", { name: "Sin cuenta regresiva" }).click();
  await page.getByRole("button", { name: "COMENZAR" }).click();

  // 5. Timer: pausa, reanuda y finaliza antes de tiempo.
  await expect(page).toHaveURL(/\/app\/session$/, { timeout: 30_000 });
  await expect(page.getByText("restantes").first()).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByText("Pausado")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Reanudar" }).click();
  await page.getByRole("button", { name: "Finalizar sesión" }).click();
  await expect(page.getByText("¡Buen esfuerzo!")).toBeVisible({ timeout: 30_000 });

  // 6. Historial con la sesión registrada.
  await page.goto("/app/history");
  await expect(
    page.getByText("Todavía no completaste ninguna sesión."),
  ).not.toBeVisible({ timeout: 15_000 });
});
