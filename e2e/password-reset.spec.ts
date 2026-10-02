import { expect, test } from "@playwright/test";

/**
 * Reset sin enviar email (sin RESEND_API_KEY en dev): el mensaje genérico
 * aparece igual, sin enumerar cuentas.
 */
test("forgot-password muestra mensaje genérico", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Correo").fill(`nadie-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await expect(page.getByText("Si existe una cuenta con ese correo")).toBeVisible({
    timeout: 15_000,
  });
});

test("login enlaza a recuperación", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Recupérala" }).click();
  await expect(page).toHaveURL(/\/forgot-password/);
});
