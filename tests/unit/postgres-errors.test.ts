import { describe, expect, it } from "vitest";
import {
  isPostgresDivisionByZero,
  isPostgresForeignKeyViolation,
} from "@/modules/players/infra/postgres-errors";

describe("isPostgresDivisionByZero", () => {
  it("matches only PostgreSQL SQLSTATE 22012", () => {
    expect(isPostgresDivisionByZero({ code: "22012" })).toBe(true);
    expect(isPostgresDivisionByZero({ code: "23505" })).toBe(false);
    expect(isPostgresDivisionByZero(new Error("division by zero"))).toBe(false);
    expect(isPostgresDivisionByZero(null)).toBe(false);
  });
});

describe("isPostgresForeignKeyViolation", () => {
  it("matches only the requested foreign-key constraint", () => {
    expect(
      isPostgresForeignKeyViolation(
        { code: "23503", constraint: "players_user_id_user_id_fk" },
        "players_user_id_user_id_fk",
      ),
    ).toBe(true);
    expect(
      isPostgresForeignKeyViolation(
        { code: "23503", constraint: "startgg_links_user_id_user_id_fk" },
        "players_user_id_user_id_fk",
      ),
    ).toBe(false);
    expect(
      isPostgresForeignKeyViolation(
        { code: "22012", constraint: "players_user_id_user_id_fk" },
        "players_user_id_user_id_fk",
      ),
    ).toBe(false);
  });
});
