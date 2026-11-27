import { beforeAll, describe, expect, it } from "vitest";
import { hashPassword, verifyPasswordHash } from "@/modules/auth/infra/password-hasher";

describe("PBKDF2 password hashing", () => {
  let encodedHash: string;

  beforeAll(async () => {
    encodedHash = await hashPassword("correct horse battery staple");
  });

  it("creates a versioned salted hash instead of storing the password", () => {
    expect(encodedHash).toMatch(/^pbkdf2-sha256\$100000\$/);
    expect(encodedHash).not.toContain("correct horse battery staple");
  });

  it("verifies the matching password and rejects a different one", async () => {
    await expect(
      verifyPasswordHash({ hash: encodedHash, password: "correct horse battery staple" }),
    ).resolves.toBe(true);
    await expect(
      verifyPasswordHash({ hash: encodedHash, password: "wrong password" }),
    ).resolves.toBe(false);
  });

  it("rejects malformed or unsupported hash encodings", async () => {
    await expect(verifyPasswordHash({ hash: "not-a-hash", password: "anything" })).resolves.toBe(
      false,
    );
    await expect(
      verifyPasswordHash({ hash: "pbkdf2-sha256$100001$abc$abc", password: "anything" }),
    ).resolves.toBe(false);
  });
});
