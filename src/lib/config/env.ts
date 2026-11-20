import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  ADMIN_DISCORD_IDS: z.string().default(""),
  STARTGG_API_TOKEN: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
