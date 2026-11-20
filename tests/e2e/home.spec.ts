import { expect, test } from "@playwright/test";

test("landing page loads in Spanish", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ValenciaSmash/);
  await expect(page.getByRole("heading", { name: "ValenciaSmash" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});
