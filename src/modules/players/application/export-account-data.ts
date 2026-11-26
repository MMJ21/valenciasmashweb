import { and, asc, eq, isNull } from "drizzle-orm";
import * as authSchema from "@/lib/db/auth-schema";
import { createPlayersDatabase } from "../infra/database";
import * as schema from "../infra/schema";

export interface AccountDataExport {
  readonly formatVersion: 1;
  readonly exportedAt: string;
  readonly account: {
    readonly username: string;
    readonly name: string;
    readonly email: string;
    readonly emailVerified: boolean;
    readonly image: string | null;
    readonly role: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly adultConfirmed: boolean;
    readonly terms: {
      readonly accepted: boolean;
      readonly acceptedAt: string | null;
      readonly version: string | null;
    };
  };
  readonly player: {
    readonly createdAt: string;
    readonly startggPlayerId: string | null;
    readonly startggSlug: string | null;
    readonly gamertag: string | null;
    readonly firstName: string | null;
    readonly lastName: string | null;
    readonly twitter: string | null;
    readonly twitch: string | null;
    readonly avatarUrl: string | null;
    readonly bio: string | null;
    readonly characters: readonly {
      readonly id: string;
      readonly isMain: boolean;
    }[];
  } | null;
  readonly startggLinks: readonly {
    readonly startggUserId: string;
    readonly status: string;
    readonly verifiedVia: string | null;
    readonly createdAt: string;
  }[];
}

export async function exportAccountData(
  userId: string,
  exportedAt: Date = new Date(),
): Promise<AccountDataExport | null> {
  const database = await createPlayersDatabase();
  const [user] = await database
    .select({
      username: authSchema.user.username,
      name: authSchema.user.name,
      email: authSchema.user.email,
      emailVerified: authSchema.user.emailVerified,
      image: authSchema.user.image,
      role: authSchema.user.role,
      createdAt: authSchema.user.createdAt,
      updatedAt: authSchema.user.updatedAt,
      adultConfirmed: authSchema.user.adultConfirmed,
      termsAccepted: authSchema.user.termsAccepted,
      termsAcceptedAt: authSchema.user.termsAcceptedAt,
      termsVersion: authSchema.user.termsVersion,
    })
    .from(authSchema.user)
    .where(and(eq(authSchema.user.id, userId), isNull(authSchema.user.deletedAt)))
    .limit(1);

  if (user === undefined) return null;

  const [player] = await database
    .select({
      id: schema.players.id,
      createdAt: schema.players.createdAt,
      startggPlayerId: schema.players.startggPlayerId,
      startggSlug: schema.players.startggSlug,
      gamertag: schema.players.gamertag,
      firstName: schema.players.firstName,
      lastName: schema.players.lastName,
      twitter: schema.players.twitter,
      twitch: schema.players.twitch,
      avatarUrl: schema.players.avatarUrl,
      bio: schema.players.bio,
    })
    .from(schema.players)
    .where(eq(schema.players.userId, userId))
    .limit(1);

  const characters =
    player === undefined
      ? []
      : await database
          .select({
            id: schema.playerCharacters.characterId,
            isMain: schema.playerCharacters.isMain,
          })
          .from(schema.playerCharacters)
          .where(eq(schema.playerCharacters.playerId, player.id));

  const startggLinks = await database
    .select({
      startggUserId: schema.startggLinks.startggUserId,
      status: schema.startggLinks.status,
      verifiedVia: schema.startggLinks.verifiedVia,
      createdAt: schema.startggLinks.createdAt,
    })
    .from(schema.startggLinks)
    .where(eq(schema.startggLinks.userId, userId))
    .orderBy(asc(schema.startggLinks.createdAt));

  return {
    formatVersion: 1,
    exportedAt: exportedAt.toISOString(),
    account: {
      username: user.username,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      adultConfirmed: user.adultConfirmed,
      terms: {
        accepted: user.termsAccepted,
        acceptedAt: user.termsAcceptedAt?.toISOString() ?? null,
        version: user.termsVersion,
      },
    },
    player:
      player === undefined
        ? null
        : {
            createdAt: player.createdAt.toISOString(),
            startggPlayerId: player.startggPlayerId,
            startggSlug: player.startggSlug,
            gamertag: player.gamertag,
            firstName: player.firstName,
            lastName: player.lastName,
            twitter: player.twitter,
            twitch: player.twitch,
            avatarUrl: player.avatarUrl,
            bio: player.bio,
            characters,
          },
    startggLinks: startggLinks.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
    })),
  };
}
