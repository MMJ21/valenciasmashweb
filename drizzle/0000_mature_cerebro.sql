CREATE TABLE "player_characters" (
	"player_id" uuid NOT NULL,
	"character_id" varchar(64) NOT NULL,
	"is_main" boolean DEFAULT false NOT NULL,
	CONSTRAINT "player_characters_player_id_character_id_pk" PRIMARY KEY("player_id","character_id")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"startgg_player_id" varchar(64),
	"startgg_slug" text,
	"gamertag" text,
	"display_name" text,
	"avatar_url" text,
	"bio" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "players_startgg_player_id_unique" UNIQUE("startgg_player_id")
);
--> statement-breakpoint
CREATE TABLE "startgg_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"startgg_user_id" varchar(64) NOT NULL,
	"status" varchar(16) NOT NULL,
	"verified_via" varchar(16),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar(32),
	"email" text,
	"role" varchar(16) DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
ALTER TABLE "player_characters" ADD CONSTRAINT "player_characters_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startgg_links" ADD CONSTRAINT "startgg_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "startgg_links_user_external_unique" ON "startgg_links" USING btree ("user_id","startgg_user_id");