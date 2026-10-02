import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3103",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- -p 3103",
    url: "http://localhost:3103/api/auth/session",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Sin override de env: usa la DB dev real (.env). Los usuarios E2E son
    // únicos por corrida (e2e-<timestamp>@...) y no colisionan.
  },
});
