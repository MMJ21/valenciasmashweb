import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

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

async function readPlaywrightServerLog(): Promise<string> {
  try {
    return await readFile(resolve(process.cwd(), ".data", "playwright-server.log"), "utf8");
  } catch {
    return "";
  }
}

async function uploadAvatar(page: Page): Promise<string> {
  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/players/me") && response.request().method() === "POST",
  );
  await page.getByLabel(/Foto de perfil/).setInputFiles({
    name: "mario.png",
    mimeType: "image/png",
    buffer: await readFile(resolve(process.cwd(), "public/characters/mario.png")),
  });
  const uploadResponse = await uploadResponsePromise;
  const uploadBody = await uploadResponse.text();
  expect(uploadResponse.status(), uploadBody).toBe(200);
  const uploadResult: unknown = JSON.parse(uploadBody);
  if (
    typeof uploadResult !== "object" ||
    uploadResult === null ||
    !("avatarUrl" in uploadResult) ||
    typeof uploadResult.avatarUrl !== "string"
  ) {
    throw new Error("La respuesta de subida no incluyó avatarUrl.");
  }
  return uploadResult.avatarUrl;
}

test("REQ-200, REQ-201, REQ-205: registro, verificación, edición y baja", async ({ page }) => {
  test.setTimeout(120_000);
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
  const username = `e2e${suffix}`;
  const email = `${username}@example.test`;
  const password = "ValenciaSmashE2E-2026!";
  const gamertag = `Nick${suffix}`;

  const anonymousExport = await page.request.get("/api/account/export");
  expect(anonymousExport.status()).toBe(401);

  await page.goto("/auth/sign-up");
  await page.getByLabel("Usuario").fill(username);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("checkbox").check();
  await expect(
    page.getByRole("link", { name: "política de privacidad", exact: true }),
  ).toHaveAttribute("href", "/legal/privacy");
  await expect(page.getByRole("link", { name: "aviso legal", exact: true })).toHaveAttribute(
    "href",
    "/legal/aviso-legal",
  );
  await expect(
    page.getByRole("link", { name: "política de cookies", exact: true }),
  ).toHaveAttribute("href", "/legal/cookies");
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
  expect(new URL(verificationUrl).origin).toBe("http://127.0.0.1:3100");

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
  await page.getByRole("button", { name: /Personaje principal/ }).click();
  await page.getByRole("option", { name: "Mario", exact: true }).click();
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

  const invalidImageResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/players/me") && response.request().method() === "POST",
  );
  await page.getByLabel(/Foto de perfil/).setInputFiles({
    name: "malformed.png",
    mimeType: "image/png",
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  });
  const invalidImageResponse = await invalidImageResponsePromise;
  expect(invalidImageResponse.status(), await invalidImageResponse.text()).toBe(400);

  const firstAvatarUrl = await uploadAvatar(page);
  const firstAvatarResponse = await page.request.get(firstAvatarUrl);
  expect(firstAvatarResponse.status()).toBe(200);
  expect(firstAvatarResponse.headers()["content-type"]).toContain("image/webp");
  expect(firstAvatarResponse.headers()["cache-control"]).toContain("no-store");
  const firstAvatarBytes = await firstAvatarResponse.body();
  expect(firstAvatarBytes.toString("ascii", 0, 4)).toBe("RIFF");
  expect(firstAvatarBytes.toString("ascii", 8, 12)).toBe("WEBP");
  const avatarPreview = page
    .locator(".profile-form label")
    .filter({ hasText: "Foto de perfil" })
    .locator("img");
  await expect
    .poll(() =>
      avatarPreview.evaluate((image) =>
        image instanceof HTMLImageElement ? image.naturalWidth : 0,
      ),
    )
    .toBe(512);

  const replacementAvatarUrl = await uploadAvatar(page);
  expect(replacementAvatarUrl).not.toBe(firstAvatarUrl);
  const replacementAvatarResponse = await page.request.get(replacementAvatarUrl);
  expect(replacementAvatarResponse.status()).toBe(200);
  expect(replacementAvatarResponse.headers()["content-type"]).toContain("image/webp");
  await expect(avatarPreview).toHaveAttribute("src", replacementAvatarUrl);
  await expect
    .poll(() =>
      avatarPreview.evaluate((image) =>
        image instanceof HTMLImageElement ? image.naturalWidth : 0,
      ),
    )
    .toBe(512);

  const exportResponse = await page.request.get("/api/account/export");
  expect(exportResponse.status()).toBe(200);
  expect(exportResponse.headers()["cache-control"]).toContain("no-store");
  expect(exportResponse.headers()["content-disposition"]).toContain("attachment");
  const exportedData: unknown = await exportResponse.json();
  expect(exportedData).toMatchObject({
    formatVersion: 1,
    account: {
      username,
      email,
      terms: {
        accepted: true,
        acceptedAt: expect.any(String),
        version: "2026-11-26-v2",
      },
    },
    sessions: expect.arrayContaining([
      expect.objectContaining({
        createdAt: expect.any(String),
        expiresAt: expect.any(String),
        userAgent: expect.any(String),
      }),
    ]),
    player: {
      gamertag,
      firstName: "Prueba",
      lastName: "E2E",
      characters: [{ id: "mario", isMain: true }],
    },
  });
  expect(JSON.stringify(exportedData)).not.toMatch(
    /"(?:password|token|accessToken|refreshToken)"/i,
  );
  await page.goto(`/players/${username}`);
  await expect(page.getByText(`Nick: ${gamertag}`)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prueba E2E" })).toBeVisible();

  await page.goto("/account");
  await page.getByLabel("Confirma tu contraseña para eliminar la cuenta").fill(password);
  page.once("dialog", (dialog) => dialog.accept());
  const serverLogBeforeRace = await readPlaywrightServerLog();
  const armBarrierResponse = await page.request.post("/api/dev/e2e/avatar-barrier", {
    data: { action: "arm" },
  });
  expect(armBarrierResponse.status()).toBe(204);
  const inFlightAvatarResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/players/me") && response.request().method() === "POST",
  );
  await page.getByLabel(/Foto de perfil/).setInputFiles({
    name: "mario.png",
    mimeType: "image/png",
    buffer: await readFile(resolve(process.cwd(), "public/characters/mario.png")),
  });
  const avatarUploadCompletion = inFlightAvatarResponse;
  let inFlightUserId: string | null = null;
  await expect
    .poll(async () => {
      const currentLog = await readPlaywrightServerLog();
      const newLines = currentLog.slice(serverLogBeforeRace.length).split(/\r?\n/);
      const writerLine = newLines.find((line) => line.includes("[E2E avatar] writer ready "));
      inFlightUserId = writerLine?.split("[E2E avatar] writer ready ")[1] ?? null;
      return inFlightUserId;
    })
    .not.toBeNull();
  if (inFlightUserId === null) {
    throw new Error("La subida E2E no alcanzó la barrera del servidor.");
  }
  const deleteResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/delete-user") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Eliminar mi cuenta" }).click();
  await expect
    .poll(async () =>
      (await readPlaywrightServerLog()).includes(
        `[E2E avatar] account deletion marked ${inFlightUserId}`,
      ),
    )
    .toBe(true);
  const releaseBarrierResponse = await page.request.post("/api/dev/e2e/avatar-barrier", {
    data: { action: "release", userId: inFlightUserId },
  });
  expect(releaseBarrierResponse.status()).toBe(204);
  const deleteResponse = await deleteResponsePromise;
  expect(deleteResponse.ok()).toBe(true);
  const avatarUploadResponse = await avatarUploadCompletion;
  expect(avatarUploadResponse.status()).toBe(409);
  await expect
    .poll(async () => {
      const currentLog = await readPlaywrightServerLog();
      const reservationReleasedAt = currentLog.indexOf(
        `[E2E avatar] reservation released ${inFlightUserId}`,
      );
      const deletionCompletedAt = currentLog.indexOf(
        `[E2E avatar] account deletion completed ${inFlightUserId}`,
      );
      return reservationReleasedAt >= 0 && deletionCompletedAt >= 0;
    })
    .toBe(true);
  await expect(page).toHaveURL("http://127.0.0.1:3100/");

  const publicProfileResponse = await page.goto(`/players/${username}`);
  expect(publicProfileResponse?.status()).toBe(404);
  const deletedAvatarResponse = await page.request.get(replacementAvatarUrl);
  expect(deletedAvatarResponse.status()).toBe(404);
});
