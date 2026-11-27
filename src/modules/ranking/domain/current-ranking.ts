export interface CurrentRankingEntry {
  readonly position: number;
  readonly username: string;
  readonly characterId: string;
  readonly movement:
    | { readonly direction: "up"; readonly places: number }
    | { readonly direction: "down"; readonly places: number }
    | { readonly direction: "same" };
}

/** Provisional current-season snapshot supplied by the community until ranking persistence exists. */
export const CURRENT_RANKING = [
  {
    position: 1,
    username: "MVL",
    characterId: "diddy-kong",
    movement: { direction: "same" },
  },
  {
    position: 2,
    username: "Nub",
    characterId: "joker",
    movement: { direction: "up", places: 2 },
  },
  {
    position: 3,
    username: "Samu",
    characterId: "roy",
    movement: { direction: "same" },
  },
  {
    position: 4,
    username: "Sir William",
    characterId: "palutena",
    movement: { direction: "down", places: 2 },
  },
  {
    position: 5,
    username: "Raptor",
    characterId: "meta-knight",
    movement: { direction: "same" },
  },
] as const satisfies readonly CurrentRankingEntry[];
