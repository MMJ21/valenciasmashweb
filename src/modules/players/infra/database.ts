import { createDatabase } from "@/lib/db";
import type { AppDatabase } from "@/lib/db";
import * as schema from "./schema";

export function createPlayersDatabase(): Promise<AppDatabase<typeof schema>> {
  return createDatabase(schema);
}
