import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { env } from "@/lib/config/env";

export type AppDatabase<TSchema extends Record<string, unknown>> =
  NeonHttpDatabase<TSchema> | PgliteDatabase<TSchema>;

export async function createDatabase<TSchema extends Record<string, unknown>>(
  schema: TSchema,
): Promise<AppDatabase<TSchema>> {
  if (env.DATABASE_URL !== undefined) {
    const client = neon(env.DATABASE_URL);
    return drizzle({ client, schema });
  }

  if (process.env.NODE_ENV === "development") {
    const { createLocalDatabase } = await import("./pglite");
    return createLocalDatabase(schema);
  }

  throw new Error("DATABASE_URL es obligatoria fuera del modo de desarrollo local.");
}
