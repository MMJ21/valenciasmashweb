import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { createLocalDatabase, closeLocalDatabase } from "../src/lib/db/pglite";
import * as schema from "../src/modules/players/infra/schema";

const DATA_DIRECTORY = resolve(process.cwd(), ".data", "pglite");
const SHOULD_RESET = process.argv.includes("--reset");

async function seedLocalDatabase(): Promise<void> {
  if (SHOULD_RESET) {
    await rm(DATA_DIRECTORY, { recursive: true, force: true });
  }

  const database = await createLocalDatabase(schema);

  await database
    .insert(schema.users)
    .values([
      {
        id: "00000000-0000-4000-8000-000000000001",
        discordId: "local-admin",
        email: "admin@valenciasmash.local",
        role: "admin",
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        discordId: "local-importer",
        email: "importer@valenciasmash.local",
        role: "importer",
      },
      {
        id: "00000000-0000-4000-8000-000000000003",
        discordId: "local-player",
        email: "player@valenciasmash.local",
        role: "user",
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
        displayName: "Admin local",
        bio: "Cuenta de desarrollo para probar permisos.",
      },
      {
        id: "10000000-0000-4000-8000-000000000002",
        userId: "00000000-0000-4000-8000-000000000003",
        gamertag: "PlayerVLC",
        displayName: "Jugador local",
        bio: "Perfil de prueba sin vínculo start.gg.",
      },
      {
        id: "10000000-0000-4000-8000-000000000003",
        startggPlayerId: "local-startgg-ghost-001",
        startggSlug: "jugador-fantasma-local",
        gamertag: "GhostVLC",
        displayName: "Jugador fantasma local",
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
    "Cuentas de prueba: admin@valenciasmash.local, importer@valenciasmash.local, player@valenciasmash.local",
  );
}

try {
  await seedLocalDatabase();
} finally {
  await closeLocalDatabase();
}
