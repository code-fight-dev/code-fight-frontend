import { describe, expect, it } from "vitest";

import { getRankByRating } from "@/entities/rank";
import {
  formatInteger,
  formatWinRate,
  formatWLD,
  getEntryGames,
  getEntryTier,
  getEntryTierColor,
  getSearchableLabel,
} from "@/entities/leaderboard";
import type { LeaderboardEntry } from "@/entities/leaderboard";

function createLeaderboardEntry(
  overrides: Partial<LeaderboardEntry> = {},
): LeaderboardEntry {
  return {
    displayName: "Lyosha",
    username: "lyosha",
    wins: 10,
    losses: 3,
    draws: 2,
    ratedGames: 15,
    rating: 1250,
    ...overrides,
  } as LeaderboardEntry;
}

describe("formatInteger", () => {
  it("formats integers with en-US thousands separators", () => {
    expect(formatInteger(0)).toBe("0");
    expect(formatInteger(999)).toBe("999");
    expect(formatInteger(1000)).toBe("1,000");
    expect(formatInteger(1000000)).toBe("1,000,000");
  });
});

describe("formatWinRate", () => {
  it("formats win rate as rounded percentage", () => {
    expect(formatWinRate(0)).toBe("0%");
    expect(formatWinRate(0.734)).toBe("73%");
    expect(formatWinRate(0.736)).toBe("74%");
    expect(formatWinRate(1)).toBe("100%");
  });
});

describe("formatWLD", () => {
  it("formats wins, losses and draws", () => {
    const entry = createLeaderboardEntry({
      wins: 1200,
      losses: 34,
      draws: 5,
    });

    expect(formatWLD(entry)).toBe("1,200 / 34 / 5");
  });
});

describe("getEntryGames", () => {
  it("returns ratedGames when it is greater than zero", () => {
    const entry = createLeaderboardEntry({
      wins: 10,
      losses: 3,
      draws: 2,
      ratedGames: 99,
    });

    expect(getEntryGames(entry)).toBe(99);
  });

  it("falls back to wins, losses and draws sum when ratedGames is zero", () => {
    const entry = createLeaderboardEntry({
      wins: 10,
      losses: 3,
      draws: 2,
      ratedGames: 0,
    });

    expect(getEntryGames(entry)).toBe(15);
  });
});

describe("getEntryTier", () => {
  it("returns rank tier by entry rating", () => {
    expect(getEntryTier(createLeaderboardEntry({ rating: 0 }))).toBe("E");
    expect(getEntryTier(createLeaderboardEntry({ rating: 1250 }))).toBe("D");
    expect(getEntryTier(createLeaderboardEntry({ rating: 1500 }))).toBe("C");
    expect(getEntryTier(createLeaderboardEntry({ rating: 1750 }))).toBe("B");
    expect(getEntryTier(createLeaderboardEntry({ rating: 2000 }))).toBe("A");
    expect(getEntryTier(createLeaderboardEntry({ rating: 2200 }))).toBe("S");
  });
});

describe("getEntryTierColor", () => {
  it("returns rank color by entry rating", () => {
    const entry = createLeaderboardEntry({
      rating: 2200,
    });

    expect(getEntryTierColor(entry)).toBe(getRankByRating(2200).color);
  });
});

describe("getSearchableLabel", () => {
  it("builds lowercase searchable label from display name and username", () => {
    const entry = createLeaderboardEntry({
      displayName: "Oleksiy Minakoff",
      username: "Lyosha_Dev",
    });

    expect(getSearchableLabel(entry)).toBe("oleksiy minakoff lyosha_dev");
  });
});
