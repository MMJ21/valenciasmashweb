import { describe, expect, it } from "vitest";
import { resolveInitialRole } from "@/modules/auth/domain/roles";

describe("resolveInitialRole", () => {
  it("assigns admin by email without case or surrounding-space sensitivity", () => {
    expect(resolveInitialRole(" Admin@Example.com ", new Set(["admin@example.com"]))).toBe("admin");
  });

  it("does not grant elevated roles to unconfigured emails", () => {
    expect(resolveInitialRole("player@example.com", new Set(["admin@example.com"]))).toBe("user");
  });
});
