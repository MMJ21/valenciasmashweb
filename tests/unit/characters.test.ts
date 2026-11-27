import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CHARACTERS } from "@/modules/players/domain/characters";

describe("character catalog", () => {
  it("has 86 unique selectable characters with normalized IDs", () => {
    expect(CHARACTERS).toHaveLength(86);
    expect(new Set(CHARACTERS.map(({ id }) => id)).size).toBe(CHARACTERS.length);
    expect(CHARACTERS.every(({ id }) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);
  });

  it("has a generated stock icon for every catalog entry", () => {
    for (const character of CHARACTERS) {
      expect(existsSync(resolve(process.cwd(), "public", character.icon.slice(1)))).toBe(true);
    }
  });

  it("uses the agreed grouped fighters and first available colors", () => {
    expect(CHARACTERS.find(({ id }) => id === "pyra-mythra")?.sourceIcon).toBe("Pyra1.png");
    expect(CHARACTERS.find(({ id }) => id === "pokemon-trainer")?.sourceIcon).toBe(
      "PokemonTrainer1.png",
    );
    expect(CHARACTERS.find(({ id }) => id === "ice-climbers")?.sourceIcon).toBe(
      "IceClimbersPopo1.png",
    );
    expect(CHARACTERS.find(({ id }) => id === "chrom")?.sourceIcon).toBe("Chrom0.png");
    expect(CHARACTERS.find(({ id }) => id === "ken")?.sourceIcon).toBe("Ken0.png");
    expect(CHARACTERS.find(({ id }) => id === "ridley")?.sourceIcon).toBe("Ridley5.png");
  });
});
