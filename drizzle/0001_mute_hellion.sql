ALTER TABLE "rateLimit" DROP CONSTRAINT "rateLimit_pkey";--> statement-breakpoint
ALTER TABLE "rateLimit" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "rateLimit" ADD CONSTRAINT "rateLimit_pkey" PRIMARY KEY("id");--> statement-breakpoint
ALTER TABLE "rateLimit" ADD CONSTRAINT "rateLimit_key_unique" UNIQUE("key");
