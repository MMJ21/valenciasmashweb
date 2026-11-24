import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  ADMIN_EMAILS: z.string().default(""),
  STARTGG_API_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
