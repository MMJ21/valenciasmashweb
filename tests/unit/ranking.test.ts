import { describe, expect, it } from "vitest";
import { CHARACTERS } from "@/modules/players/domain/characters";
import { CURRENT_RANKING } from "@/modules/ranking/domain/current-ranking";

describe("current top-five ranking", () => {
  it("keeps five ordered entries and valid character icons", () => {
    expect(CURRENT_RANKING.map(({ position }) => position)).toEqual([1, 2, 3, 4, 5]);
    expect(
      CURRENT_RANKING.every((entry) =>
        CHARACTERS.some((character) => character.id === entry.characterId),
      ),
    ).toBe(true);
  });

  it("contains the supplied positions and movement data", () => {
    expect(CURRENT_RANKING.map(({ username }) => username)).toEqual([
      "MVL",
      "Nub",
      "Samu",
      "Sir William",
      "Raptor",
    ]);
    expect(CURRENT_RANKING.map(({ movement }) => movement.direction)).toEqual([
      "same",
      "up",
      "same",
      "down",
      "same",
    ]);
  });
});
