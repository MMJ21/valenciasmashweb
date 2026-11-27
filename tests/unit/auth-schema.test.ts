import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import * as authSchema from "@/lib/db/auth-schema";

describe("Better Auth Drizzle schema", () => {
  it("defines an id column on each authentication table", () => {
    const tables = [
      authSchema.user,
      authSchema.session,
      authSchema.account,
      authSchema.verification,
      authSchema.rateLimit,
    ];

    for (const table of tables) {
      const { name, columns } = getTableConfig(table);
      expect(
        columns.map(({ name: columnName }) => columnName),
        name,
      ).toContain("id");
    }
  });

  it("stores the accepted terms version and timestamp without requiring legacy backfill", () => {
    const columns = getTableConfig(authSchema.user).columns;
    expect(columns.find(({ name }) => name === "terms_accepted_at")?.notNull).toBe(false);
    expect(columns.find(({ name }) => name === "terms_version")?.notNull).toBe(false);
  });
});
