import { describe, expect, it } from "vitest";
import { assertEligibleForAdminPromotion, resolveInitialRole } from "@/modules/auth/domain/roles";

describe("resolveInitialRole", () => {
  it("always registers new accounts with the user role", () => {
    expect(resolveInitialRole()).toBe("user");
  });
});

describe("assertEligibleForAdminPromotion", () => {
  it("requires a verified email and an active account", () => {
    expect(() => assertEligibleForAdminPromotion(undefined)).toThrow("No existe");
    expect(() =>
      assertEligibleForAdminPromotion({ emailVerified: false, deletedAt: null }),
    ).toThrow("verificar su correo");
    expect(() =>
      assertEligibleForAdminPromotion({ emailVerified: true, deletedAt: new Date() }),
    ).toThrow("eliminación");
    expect(() =>
      assertEligibleForAdminPromotion({ emailVerified: true, deletedAt: null }),
    ).not.toThrow();
  });
});
