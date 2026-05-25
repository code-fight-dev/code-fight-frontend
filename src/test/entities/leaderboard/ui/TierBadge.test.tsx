import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getEntryTierColor, TierBadge } from "@/entities/leaderboard";
import type { LeaderboardEntry } from "@/entities/leaderboard";

function createEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    rank: 1,
    userId: "user-alice",
    username: "alice",
    displayName: "Alice",
    avatarUrl: "",
    country: "United States",
    countryCode: "US",
    rating: 2200,
    ratedGames: 20,
    wins: 10,
    losses: 8,
    draws: 2,
    winRate: 0.5,
    ...overrides,
  };
}

describe("TierBadge", () => {
  it("renders S tier with highlighted style", () => {
    render(<TierBadge entry={createEntry({ rating: 2200 })} />);

    const badge = screen.getByText("S");
    expect(badge).toHaveStyle({
      color: "rgb(138, 101, 0)",
      borderColor: "rgba(184, 134, 11, 0.46)",
    });
    expect(badge.getAttribute("style")).toContain("linear-gradient");
  });

  it("renders non-S tier with color-based style", () => {
    const entry = createEntry({ rating: 1600 });
    const color = getEntryTierColor(entry);

    render(<TierBadge entry={entry} />);

    const badge = screen.getByText("C");
    expect(badge).toHaveStyle({
      color,
      borderColor: `${color}44`,
      background: `${color}1A`,
    });
  });
});
