import { describe, expect, it } from "vitest";
import { playerProfileInputSchema } from "@/modules/players/domain/profile-input";

const profile = {
  gamertag: "VLC",
  firstName: "Valencia",
  lastName: "Player",
  twitter: "valencia",
  twitch: "valencia",
  bio: "Main Pyra.",
  characters: [{ id: "pyra-mythra", isMain: true }],
};

describe("player profile input", () => {
  it("accepts a main and an optional secondary character", () => {
    expect(
      playerProfileInputSchema.safeParse({
        ...profile,
        characters: [
          { id: "pyra-mythra", isMain: true },
          { id: "ike", isMain: false },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects more than two characters, duplicate IDs, and missing main", () => {
    expect(
      playerProfileInputSchema.safeParse({
        ...profile,
        characters: [
          { id: "pyra-mythra", isMain: true },
          { id: "ike", isMain: false },
          { id: "fox", isMain: false },
        ],
      }).success,
    ).toBe(false);
    expect(
      playerProfileInputSchema.safeParse({
        ...profile,
        characters: [
          { id: "ike", isMain: false },
          { id: "ike", isMain: false },
        ],
      }).success,
    ).toBe(false);
    expect(
      playerProfileInputSchema.safeParse({ ...profile, characters: [{ id: "ike", isMain: false }] })
        .success,
    ).toBe(false);
  });

  it("rejects unknown characters and bios over 500 characters", () => {
    expect(
      playerProfileInputSchema.safeParse({
        ...profile,
        characters: [{ id: "unknown-fighter", isMain: true }],
      }).success,
    ).toBe(false);
    expect(playerProfileInputSchema.safeParse({ ...profile, bio: "x".repeat(501) }).success).toBe(
      false,
    );
  });
});
