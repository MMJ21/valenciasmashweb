import { createDatabase } from "@/lib/db";
import type { AppDatabase } from "@/lib/db";
import * as authSchema from "../../../lib/db/auth-schema";
import * as schema from "./schema";

const databaseSchema = { ...authSchema, ...schema };

export function createPlayersDatabase(): Promise<AppDatabase<typeof databaseSchema>> {
  return createDatabase(databaseSchema);
}
