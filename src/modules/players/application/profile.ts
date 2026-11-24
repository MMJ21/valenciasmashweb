import { eq } from "drizzle-orm";
import { AppError } from "@/lib/errors";
import * as authSchema from "@/lib/db/auth-schema";
import type { PlayerProfileInput } from "../domain/profile-input";
import { createPlayersDatabase } from "../infra/database";
import * as schema from "../infra/schema";

export interface PlayerProfileCharacter {
  readonly id: string;
  readonly isMain: boolean;
}

export interface PlayerProfile {
  readonly userId: string;
  readonly username: string;
  readonly gamertag: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly twitter: string | null;
  readonly twitch: string | null;
  readonly bio: string | null;
  readonly avatarUrl: string | null;
  readonly characters: readonly PlayerProfileCharacter[];
}

async function loadProfile(userId: string): Promise<PlayerProfile | null> {
  const database = await createPlayersDatabase();
  const [record] = await database
    .select({
      userId: authSchema.user.id,
      username: authSchema.user.username,
      gamertag: schema.players.gamertag,
      firstName: schema.players.firstName,
      lastName: schema.players.lastName,
      twitter: schema.players.twitter,
      twitch: schema.players.twitch,
      bio: schema.players.bio,
      avatarUrl: schema.players.avatarUrl,
      playerId: schema.players.id,
    })
    .from(authSchema.user)
    .innerJoin(schema.players, eq(schema.players.userId, authSchema.user.id))
    .where(eq(authSchema.user.id, userId))
    .limit(1);

  if (record === undefined) {
    return null;
  }

  const characters = await database
    .select({ id: schema.playerCharacters.characterId, isMain: schema.playerCharacters.isMain })
    .from(schema.playerCharacters)
    .where(eq(schema.playerCharacters.playerId, record.playerId));

  return {
    userId: record.userId,
    username: record.username,
    gamertag: record.gamertag,
    firstName: record.firstName,
    lastName: record.lastName,
    twitter: record.twitter,
    twitch: record.twitch,
    bio: record.bio,
    avatarUrl: record.avatarUrl,
    characters,
  };
}

export async function getOwnPlayerProfile(userId: string): Promise<PlayerProfile | null> {
  return loadProfile(userId);
}

export async function getPublicPlayerProfile(username: string): Promise<PlayerProfile | null> {
  const database = await createPlayersDatabase();
  const [record] = await database
    .select({ userId: authSchema.user.id })
    .from(authSchema.user)
    .where(eq(authSchema.user.username, username))
    .limit(1);
  return record === undefined ? null : loadProfile(record.userId);
}

export interface UpdatePlayerProfileInput extends PlayerProfileInput {
  readonly userId: string;
}

export async function updatePlayerProfile(input: UpdatePlayerProfileInput): Promise<void> {
  const database = await createPlayersDatabase();
  const [player] = await database
    .select({ id: schema.players.id })
    .from(schema.players)
    .where(eq(schema.players.userId, input.userId))
    .limit(1);

  if (player === undefined) {
    throw new AppError("No se encontró la ficha asociada a esta cuenta.", "NOT_FOUND");
  }

  await database.transaction(async (transaction) => {
    await transaction
      .update(schema.players)
      .set({
        gamertag: input.gamertag,
        firstName: input.firstName,
        lastName: input.lastName,
        twitter: input.twitter.length === 0 ? null : input.twitter.replace(/^@/, ""),
        twitch: input.twitch.length === 0 ? null : input.twitch.replace(/^@/, ""),
        bio: input.bio,
      })
      .where(eq(schema.players.id, player.id));
    await transaction
      .delete(schema.playerCharacters)
      .where(eq(schema.playerCharacters.playerId, player.id));
    if (input.characters.length > 0) {
      await transaction.insert(schema.playerCharacters).values(
        input.characters.map((character) => ({
          playerId: player.id,
          characterId: character.id,
          isMain: character.isMain,
        })),
      );
    }
  });
}
