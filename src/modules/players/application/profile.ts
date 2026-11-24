import { and, eq, sql } from "drizzle-orm";
import { AppError } from "@/lib/errors";
import * as authSchema from "@/lib/db/auth-schema";
import type { PlayerProfileInput } from "../domain/profile-input";
import { createPlayersDatabase } from "../infra/database";
import * as schema from "../infra/schema";

type PlayerDatabase = Awaited<ReturnType<typeof createPlayersDatabase>>;

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

async function ensurePlayerExists(database: PlayerDatabase, userId: string): Promise<void> {
  // The Better Auth post-create hook can fail after the account is committed; repair on next use.
  await database.insert(schema.players).values({ userId }).onConflictDoNothing();
}

async function loadProfile(
  database: PlayerDatabase,
  userId: string,
): Promise<PlayerProfile | null> {
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
  const database = await createPlayersDatabase();
  await ensurePlayerExists(database, userId);
  return loadProfile(database, userId);
}

export async function getPublicPlayerProfile(username: string): Promise<PlayerProfile | null> {
  const database = await createPlayersDatabase();
  const [record] = await database
    .select({ userId: authSchema.user.id })
    .from(authSchema.user)
    .where(eq(authSchema.user.username, username))
    .limit(1);
  return record === undefined ? null : loadProfile(database, record.userId);
}

export interface UpdatePlayerProfileInput extends PlayerProfileInput {
  readonly userId: string;
}

export async function updatePlayerProfile(input: UpdatePlayerProfileInput): Promise<void> {
  const database = await createPlayersDatabase();
  await ensurePlayerExists(database, input.userId);
  const [player] = await database
    .select({ id: schema.players.id })
    .from(schema.players)
    .where(eq(schema.players.userId, input.userId))
    .limit(1);

  if (player === undefined) {
    throw new AppError("No se encontró la ficha asociada a esta cuenta.", "NOT_FOUND");
  }

  const profileChanges = {
    gamertag: input.gamertag,
    firstName: input.firstName,
    lastName: input.lastName,
    twitter: input.twitter.length === 0 ? null : input.twitter.replace(/^@/, ""),
    twitch: input.twitch.length === 0 ? null : input.twitch.replace(/^@/, ""),
    bio: input.bio,
  };
  const playerOwnership = and(
    eq(schema.players.id, player.id),
    eq(schema.players.userId, input.userId),
  );
  const deleteCharacters = database
    .delete(schema.playerCharacters)
    .where(eq(schema.playerCharacters.playerId, player.id));

  if ("batch" in database) {
    const updatePlayer = database.update(schema.players).set(profileChanges).where(playerOwnership);
    const assertOwnership = database.execute(sql`
      SELECT 1 / COUNT(*)
      FROM ${schema.players}
      WHERE ${schema.players.id} = ${player.id}
        AND ${schema.players.userId} = ${input.userId}
    `);

    // Neon HTTP batches run transactionally; the guard aborts before character writes on a race.
    if (input.characters.length === 0) {
      await database.batch([updatePlayer, assertOwnership, deleteCharacters]);
      return;
    }

    await database.batch([
      updatePlayer,
      assertOwnership,
      deleteCharacters,
      database.insert(schema.playerCharacters).values(
        input.characters.map((character) => ({
          playerId: player.id,
          characterId: character.id,
          isMain: character.isMain,
        })),
      ),
    ]);
    return;
  }

  await database.transaction(async (transaction) => {
    const updatedPlayers = await transaction
      .update(schema.players)
      .set(profileChanges)
      .where(playerOwnership)
      .returning({ id: schema.players.id });
    if (updatedPlayers.length === 0) {
      throw new AppError("La ficha ya no pertenece a esta cuenta.", "NOT_FOUND");
    }
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
