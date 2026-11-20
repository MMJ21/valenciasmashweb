import {
  boolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  discordId: varchar("discord_id", { length: 32 }).unique(),
  email: text("email"),
  role: varchar("role", { length: 16 }).notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .unique()
    .references(() => users.id),
  startggPlayerId: varchar("startgg_player_id", { length: 64 }).unique(),
  startggSlug: text("startgg_slug"),
  gamertag: text("gamertag"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: varchar("bio", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const startggLinks = pgTable(
  "startgg_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    startggUserId: varchar("startgg_user_id", { length: 64 }).notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    verifiedVia: varchar("verified_via", { length: 16 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("startgg_links_user_external_unique").on(table.userId, table.startggUserId),
  ],
);

export const playerCharacters = pgTable(
  "player_characters",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id),
    characterId: varchar("character_id", { length: 64 }).notNull(),
    isMain: boolean("is_main").notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.characterId] })],
);
