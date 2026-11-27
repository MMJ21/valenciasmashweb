import { eq, isNull } from "drizzle-orm";
import * as authSchema from "@/lib/db/auth-schema";
import { createPlayersDatabase } from "../infra/database";
import { players } from "../infra/schema";

export interface DevelopmentPlayer {
  readonly id: string;
  readonly gamertag: string | null;
}

export async function listPlayersForDevelopment(): Promise<DevelopmentPlayer[]> {
  const database = await createPlayersDatabase();
  return database
    .select({
      id: players.id,
      gamertag: players.gamertag,
    })
    .from(players)
    .innerJoin(authSchema.user, eq(authSchema.user.id, players.userId))
    .where(isNull(authSchema.user.deletedAt));
}
