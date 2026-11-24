import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { inArray } from "drizzle-orm";
import { createLocalDatabase, closeLocalDatabase } from "../src/lib/db/pglite";
import * as authSchema from "../src/lib/db/auth-schema";
import { hashPassword } from "../src/modules/auth/infra/password-hasher";
import * as schema from "../src/modules/players/infra/schema";

const DATA_DIRECTORY = resolve(process.cwd(), ".data", "pglite");
const SHOULD_RESET = process.argv.includes("--reset");
const databaseSchema = { ...authSchema, ...schema };

async function seedLocalDatabase(): Promise<void> {
  if (SHOULD_RESET) {
    await rm(DATA_DIRECTORY, { recursive: true, force: true });
  }

  const database = await createLocalDatabase(databaseSchema);

  await database
    .insert(authSchema.user)
    .values([
      {
        id: "00000000-0000-4000-8000-000000000001",
        name: "Admin local",
        username: "localadmin",
        displayUsername: "localadmin",
        email: "admin@valenciasmash.local",
        emailVerified: true,
        role: "admin",
        adultConfirmed: true,
        termsAccepted: true,
        updatedAt: new Date(),
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        name: "Importer local",
        username: "localimporter",
        displayUsername: "localimporter",
        email: "importer@valenciasmash.local",
        emailVerified: true,
        role: "importer",
        adultConfirmed: true,
        termsAccepted: true,
        updatedAt: new Date(),
      },
      {
        id: "00000000-0000-4000-8000-000000000003",
        name: "Jugador local",
        username: "localplayer",
        displayUsername: "localplayer",
        email: "player@valenciasmash.local",
        emailVerified: true,
        role: "user",
        adultConfirmed: true,
        termsAccepted: true,
        updatedAt: new Date(),
      },
    ])
    .onConflictDoNothing();

  await database
    .update(authSchema.user)
    .set({ adultConfirmed: true, termsAccepted: true })
    .where(
      inArray(authSchema.user.id, [
        "00000000-0000-4000-8000-000000000001",
        "00000000-0000-4000-8000-000000000002",
        "00000000-0000-4000-8000-000000000003",
      ]),
    );

  const demoPasswordHash = await hashPassword("SmashVLC-2026!");
  await database
    .insert(authSchema.account)
    .values([
      {
        id: "30000000-0000-4000-8000-000000000001",
        accountId: "00000000-0000-4000-8000-000000000001",
        providerId: "credential",
        userId: "00000000-0000-4000-8000-000000000001",
        password: demoPasswordHash,
        updatedAt: new Date(),
      },
      {
        id: "30000000-0000-4000-8000-000000000002",
        accountId: "00000000-0000-4000-8000-000000000002",
        providerId: "credential",
        userId: "00000000-0000-4000-8000-000000000002",
        password: demoPasswordHash,
        updatedAt: new Date(),
      },
      {
        id: "30000000-0000-4000-8000-000000000003",
        accountId: "00000000-0000-4000-8000-000000000003",
        providerId: "credential",
        userId: "00000000-0000-4000-8000-000000000003",
        password: demoPasswordHash,
        updatedAt: new Date(),
      },
    ])
    .onConflictDoNothing();

  await database
    .insert(schema.players)
    .values([
      {
        id: "10000000-0000-4000-8000-000000000001",
        userId: "00000000-0000-4000-8000-000000000001",
        startggPlayerId: "local-startgg-001",
        startggSlug: "valencia-smash-admin",
        gamertag: "AdminVLC",
        firstName: "Admin",
        lastName: "Local",
        twitter: "valencia_admin",
        twitch: "valenciaadmin",
        bio: "Cuenta de desarrollo para probar permisos.",
      },
      {
        id: "10000000-0000-4000-8000-000000000002",
        userId: "00000000-0000-4000-8000-000000000003",
        gamertag: "PlayerVLC",
        firstName: "Jugador",
        lastName: "Local",
        bio: "Perfil de prueba sin vínculo start.gg.",
      },
      {
        id: "10000000-0000-4000-8000-000000000003",
        startggPlayerId: "local-startgg-ghost-001",
        startggSlug: "jugador-fantasma-local",
        gamertag: "GhostVLC",
        firstName: "Jugador fantasma",
        lastName: "Local",
        bio: "Jugador de prueba sin cuenta asociada.",
      },
    ])
    .onConflictDoNothing();

  await database
    .insert(schema.startggLinks)
    .values({
      id: "20000000-0000-4000-8000-000000000001",
      userId: "00000000-0000-4000-8000-000000000002",
      startggUserId: "local-startgg-user-pending",
      status: "pending",
    })
    .onConflictDoNothing();

  console.info(`Base local lista. Directorio de datos: ${DATA_DIRECTORY}`);
  console.info(
    "Cuentas: localadmin, localimporter, localplayer. Contraseña: SmashVLC-2026! (solo local)",
  );
}

try {
  await seedLocalDatabase();
} finally {
  await closeLocalDatabase();
}
