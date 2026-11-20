import { describe, expect, it } from "vitest";
import { getSeasonPeriod } from "@/lib/season";

describe("getSeasonPeriod", () => {
  it("places dates on either side of the semester boundary", () => {
    expect(getSeasonPeriod(new Date("2026-06-30T12:00:00+02:00")).key).toBe("2026-S1");
    expect(getSeasonPeriod(new Date("2026-07-01T00:00:00+02:00")).key).toBe("2026-S2");
  });

  it("uses the Europe/Madrid calendar date, including its UTC offset", () => {
    expect(getSeasonPeriod(new Date("2025-12-31T23:30:00Z")).key).toBe("2026-S1");
  });

  it("returns inclusive date boundaries", () => {
    expect(getSeasonPeriod(new Date("2026-01-15T12:00:00Z"))).toEqual({
      key: "2026-S1",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
    });
  });

  it("rejects an invalid date", () => {
    expect(() => getSeasonPeriod(new Date(Number.NaN))).toThrow("no es válida");
  });
});
