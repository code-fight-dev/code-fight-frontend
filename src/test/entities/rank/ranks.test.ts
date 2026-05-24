import { describe, expect, it } from "vitest";

import {
  formatRankRange,
  formatRankValue,
  getNextRank,
  getRankByRating,
  getRankGradient,
  RANKS,
} from "@/entities/rank";

describe("RANKS", () => {
  it("defines ranks from E to S", () => {
    expect(RANKS.map((rank) => rank.tier)).toEqual(["E", "D", "C", "B", "A", "S"]);
  });

  it("defines the first rank as default entry rank", () => {
    expect(RANKS[0]).toMatchObject({
      tier: "E",
      title: "Entry",
      min: 0,
      max: 1249,
    });
  });

  it("defines the last rank as open-ended S rank", () => {
    expect(RANKS.at(-1)).toMatchObject({
      tier: "S",
      title: "Ascendant",
      min: 2200,
      max: null,
    });
  });
});

describe("getRankByRating", () => {
  it("returns E rank for entry rating range", () => {
    expect(getRankByRating(0).tier).toBe("E");
    expect(getRankByRating(1249).tier).toBe("E");
  });

  it("returns D rank for contender rating range", () => {
    expect(getRankByRating(1250).tier).toBe("D");
    expect(getRankByRating(1499).tier).toBe("D");
  });

  it("returns C rank for operator rating range", () => {
    expect(getRankByRating(1500).tier).toBe("C");
    expect(getRankByRating(1749).tier).toBe("C");
  });

  it("returns B rank for vanguard rating range", () => {
    expect(getRankByRating(1750).tier).toBe("B");
    expect(getRankByRating(1999).tier).toBe("B");
  });

  it("returns A rank for elite rating range", () => {
    expect(getRankByRating(2000).tier).toBe("A");
    expect(getRankByRating(2199).tier).toBe("A");
  });

  it("returns S rank for ascendant rating range", () => {
    expect(getRankByRating(2200).tier).toBe("S");
    expect(getRankByRating(3000).tier).toBe("S");
  });

  it("falls back to default rank when rating does not match any rank", () => {
    expect(getRankByRating(-1)).toBe(RANKS[0]);
  });
});

describe("getNextRank", () => {
  it("returns next rank for current rating", () => {
    expect(getNextRank(0)?.tier).toBe("D");
    expect(getNextRank(1250)?.tier).toBe("C");
    expect(getNextRank(1500)?.tier).toBe("B");
    expect(getNextRank(1750)?.tier).toBe("A");
    expect(getNextRank(2000)?.tier).toBe("S");
  });

  it("returns null for invalid rating", () => {
    expect(getNextRank(-1)).toBeNull();
  });

  it("returns null for last rank", () => {
    expect(getNextRank(2200)).toBeNull();
    expect(getNextRank(3000)).toBeNull();
  });
});

describe("getRankGradient", () => {
  it("builds gradient from source color to target color", () => {
    expect(getRankGradient("#111111", "#222222")).toBe(
      "linear-gradient(90deg, #111111 0%, #222222 100%)",
    );
  });

  it("uses source color as target color when target color is missing", () => {
    expect(getRankGradient("#111111")).toBe(
      "linear-gradient(90deg, #111111 0%, #111111 100%)",
    );
  });

  it("uses source color as target color when target color is null", () => {
    expect(getRankGradient("#111111", null)).toBe(
      "linear-gradient(90deg, #111111 0%, #111111 100%)",
    );
  });

  it("uses source color as target color when target color is empty string", () => {
    expect(getRankGradient("#111111", "")).toBe(
      "linear-gradient(90deg, #111111 0%, #111111 100%)",
    );
  });
});

describe("formatRankValue", () => {
  it("formats rank value with en-US thousands separators", () => {
    expect(formatRankValue(0)).toBe("0");
    expect(formatRankValue(999)).toBe("999");
    expect(formatRankValue(1250)).toBe("1,250");
    expect(formatRankValue(1000000)).toBe("1,000,000");
  });
});

describe("formatRankRange", () => {
  it("formats closed rank range", () => {
    expect(formatRankRange({ min: 1250, max: 1499 })).toBe("1,250-1,499 Elo");
  });

  it("formats open-ended rank range", () => {
    expect(formatRankRange({ min: 2200, max: null })).toBe("2,200+ Elo");
  });
});
