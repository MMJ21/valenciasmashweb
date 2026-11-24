ALTER TABLE "user" ADD COLUMN "adult_confirmed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "terms_accepted" boolean DEFAULT false NOT NULL;