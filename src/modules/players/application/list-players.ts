import { createPlayersDatabase } from "../infra/database";
import { players } from "../infra/schema";

export interface DevelopmentPlayer {
  readonly id: string;
  readonly gamertag: string | null;
  readonly displayName: string | null;
  readonly startggPlayerId: string | null;
}

export async function listPlayersForDevelopment(): Promise<DevelopmentPlayer[]> {
  const database = await createPlayersDatabase();
  return database
    .select({
      id: players.id,
      gamertag: players.gamertag,
      displayName: players.displayName,
      startggPlayerId: players.startggPlayerId,
    })
    .from(players);
}
