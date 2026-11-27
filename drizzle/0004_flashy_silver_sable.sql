ALTER TABLE "avatar_uploads" ADD COLUMN "lease_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "avatar_uploads" ADD COLUMN "state" varchar(16) DEFAULT 'writing' NOT NULL;--> statement-breakpoint
ALTER TABLE "avatar_uploads" ADD COLUMN "expires_at" timestamp with time zone;