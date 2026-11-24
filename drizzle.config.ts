import { defineConfig } from "drizzle-kit";
import { env } from "./src/lib/config/env";

export default defineConfig({
  schema: ["./src/lib/db/auth-schema.ts", "./src/modules/*/infra/schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL ?? "postgresql://local:local@127.0.0.1:5432/valenciasmash",
  },
});
