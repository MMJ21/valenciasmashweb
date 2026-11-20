import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const DATA_DIRECTORY = resolve(process.cwd(), ".data", "pglite");
const MIGRATIONS_DIRECTORY = resolve(process.cwd(), "drizzle");

let client: PGlite | undefined;
let migrationPromise: Promise<void> | undefined;

export async function createLocalDatabase<TSchema extends Record<string, unknown>>(
  schema: TSchema,
): Promise<PgliteDatabase<TSchema>> {
  await mkdir(resolve(DATA_DIRECTORY, ".."), { recursive: true });
  client ??= new PGlite(DATA_DIRECTORY);
  await client.waitReady;

  const database = drizzle(client, { schema });
  migrationPromise ??= migrate(database, { migrationsFolder: MIGRATIONS_DIRECTORY });
  await migrationPromise;
  return database;
}

export async function closeLocalDatabase(): Promise<void> {
  const activeClient = client;
  client = undefined;
  migrationPromise = undefined;
  await activeClient?.close();
}
