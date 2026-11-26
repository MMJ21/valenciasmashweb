import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

async function findVerificationUrl(email: string): Promise<string | null> {
  try {
    const content = await readFile(
      resolve(process.cwd(), ".data", "playwright-server.log"),
      "utf8",
    );
    const lines = content.split(/\r?\n/);
    const emailLine = lines.findIndex((line) => line.includes(`[correo E2E] ${email}`));
    const actionUrl = lines[emailLine + 1]?.trim();
    return emailLine < 0 || actionUrl === undefined ? null : actionUrl;
  } catch {
    return null;
  }
}

test("REQ-200, REQ-201, REQ-205: registro, verificación, edición y baja", async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
  const username = `e2e${suffix}`;
  const email = `${username}@example.test`;
  const password = "ValenciaSmashE2E-2026!";
  const gamertag = `Nick${suffix}`;

  await page.goto("/auth/sign-up");
  await page.getByLabel("Usuario").fill(username);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("checkbox").check();
  const signUpResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/auth/sign-up/email"),
  );
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  const signUpResponse = await signUpResponsePromise;
  expect(signUpResponse.ok(), await signUpResponse.text()).toBe(true);
  await expect(page.getByRole("status")).toContainText("Cuenta creada");

  let verificationUrl: string | null = null;
  await expect
    .poll(
      async () => {
        verificationUrl = await findVerificationUrl(email);
        return verificationUrl;
      },
      { timeout: 20_000 },
    )
    .not.toBeNull();
  if (verificationUrl === null) {
    throw new Error("No se capturó el enlace local de verificación.");
  }
  expect(new URL(verificationUrl).origin).toBe("http://localhost:3100");

  await page.goto(verificationUrl);
  await expect(page.getByRole("heading", { name: "Correo verificado" })).toBeVisible();

  await page.goto("/auth/sign-in");
  await page.getByLabel("Usuario").fill(username);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/account$/, { timeout: 20_000 });
  await page.goto("/account");
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Nick", { exact: true }).fill(gamertag);
  await page.getByLabel("Nombre", { exact: true }).fill("Prueba");
  await page.getByLabel("Apellidos", { exact: true }).fill("E2E");
  await expect(page.getByLabel("Nick", { exact: true })).toHaveValue(gamertag);
  await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Prueba");
  await expect(page.getByLabel("Apellidos", { exact: true })).toHaveValue("E2E");
  const profileResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/players/me") && response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Guardar ficha" }).click();
  const profileResponse = await profileResponsePromise;
  expect(profileResponse.ok(), await profileResponse.text()).toBe(true);
  await expect(page.getByRole("status")).toContainText("Ficha guardada");
  await page.goto(`/players/${username}`);
  await expect(page.getByText(`Nick: ${gamertag}`)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prueba E2E" })).toBeVisible();

  await page.goto("/account");
  await page.getByLabel("Confirma tu contraseña para eliminar la cuenta").fill(password);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Eliminar mi cuenta" }).click();
  await expect(page).toHaveURL("http://localhost:3100/");

  const publicProfileResponse = await page.goto(`/players/${username}`);
  expect(publicProfileResponse?.status()).toBe(404);
});
