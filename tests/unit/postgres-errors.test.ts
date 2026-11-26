import { describe, expect, it } from "vitest";
import { isPostgresDivisionByZero } from "@/modules/players/infra/postgres-errors";

describe("isPostgresDivisionByZero", () => {
  it("matches only PostgreSQL SQLSTATE 22012", () => {
    expect(isPostgresDivisionByZero({ code: "22012" })).toBe(true);
    expect(isPostgresDivisionByZero({ code: "23505" })).toBe(false);
    expect(isPostgresDivisionByZero(new Error("division by zero"))).toBe(false);
    expect(isPostgresDivisionByZero(null)).toBe(false);
  });
});
