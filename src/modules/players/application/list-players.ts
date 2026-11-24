import { createPlayersDatabase } from "../infra/database";
import { players } from "../infra/schema";

export interface DevelopmentPlayer {
  readonly id: string;
  readonly gamertag: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly startggPlayerId: string | null;
}

export async function listPlayersForDevelopment(): Promise<DevelopmentPlayer[]> {
  const database = await createPlayersDatabase();
  return database
    .select({
      id: players.id,
      gamertag: players.gamertag,
      firstName: players.firstName,
      lastName: players.lastName,
      startggPlayerId: players.startggPlayerId,
    })
    .from(players);
}
