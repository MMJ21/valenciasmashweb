import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  expect: { timeout: 15_000 },
  use: { baseURL: "http://localhost:3100", ...devices["Desktop Chrome"] },
  workers: 1,
  webServer: {
    command:
      "node -e \"require('node:fs').mkdirSync('.data',{recursive:true})\" && corepack pnpm dev > .data/playwright-server.log 2>&1",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: "3100",
      PLAYWRIGHT_TEST: "true",
      BETTER_AUTH_URL: "http://localhost:3100",
      BETTER_AUTH_SECRET: "playwright-test-secret-only-not-production-123",
    },
  },
});
