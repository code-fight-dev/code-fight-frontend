import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { LeaderboardEntry } from "@/entities/leaderboard";
import { LeaderboardPodium } from "@/widgets/leaderboard-podium";

vi.mock("@/entities/leaderboard", () => ({
  formatInteger: (value: number) => value.toLocaleString("en-US"),
  formatWinRate: (value: number) => `${Math.round(value * 100)}%`,
  PlayerIdentity: ({ entry }: { entry: LeaderboardEntry }) => (
    <div>Player identity: {entry.username}</div>
  ),
  TierBadge: ({ entry }: { entry: LeaderboardEntry }) => (
    <div>Tier badge: rank {entry.rank}</div>
  ),
}));

function createEntry(overrides: Partial<LeaderboardEntry>): LeaderboardEntry {
  return {
    userId: "user-1",
    username: "player-one",
    displayName: "Player One",
    avatarUrl: null,
    rank: 1,
    rating: 2400,
    winRate: 0.75,
    wins: 30,
    losses: 10,
    tier: "diamond",
    countryCode: null,
    ...overrides,
  } as LeaderboardEntry;
}

describe("LeaderboardPodium", () => {
  it("renders only top three leaderboard entries", () => {
    const items = [
      createEntry({
        userId: "user-1",
        username: "alpha",
        rank: 1,
        rating: 2500,
        winRate: 0.82,
      }),
      createEntry({
        userId: "user-2",
        username: "bravo",
        rank: 2,
        rating: 2300,
        winRate: 0.74,
      }),
      createEntry({
        userId: "user-3",
        username: "charlie",
        rank: 3,
        rating: 2100,
        winRate: 0.68,
      }),
      createEntry({
        userId: "user-4",
        username: "delta",
        rank: 4,
        rating: 1900,
        winRate: 0.61,
      }),
    ];

    render(<LeaderboardPodium items={items} />);

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();

    expect(screen.getByText("Player identity: alpha")).toBeInTheDocument();
    expect(screen.getByText("Player identity: bravo")).toBeInTheDocument();
    expect(screen.getByText("Player identity: charlie")).toBeInTheDocument();

    expect(screen.queryByText("Player identity: delta")).not.toBeInTheDocument();
  });

  it("renders rating, winrate and tier badge for podium entries", () => {
    const items = [
      createEntry({
        userId: "user-1",
        username: "alpha",
        rank: 1,
        rating: 2500,
        winRate: 0.82,
      }),
      createEntry({
        userId: "user-2",
        username: "bravo",
        rank: 2,
        rating: 2300,
        winRate: 0.74,
      }),
      createEntry({
        userId: "user-3",
        username: "charlie",
        rank: 3,
        rating: 2100,
        winRate: 0.68,
      }),
    ];

    render(<LeaderboardPodium items={items} />);

    expect(screen.getByText("2,500")).toBeInTheDocument();
    expect(screen.getByText("2,300")).toBeInTheDocument();
    expect(screen.getByText("2,100")).toBeInTheDocument();

    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("74%")).toBeInTheDocument();
    expect(screen.getByText("68%")).toBeInTheDocument();

    expect(screen.getByText("Tier badge: rank 1")).toBeInTheDocument();
    expect(screen.getByText("Tier badge: rank 2")).toBeInTheDocument();
    expect(screen.getByText("Tier badge: rank 3")).toBeInTheDocument();
  });

  it("renders empty podium when there are no items", () => {
    render(<LeaderboardPodium items={[]} />);

    expect(screen.queryByText("Rating")).not.toBeInTheDocument();
    expect(screen.queryByText("Winrate")).not.toBeInTheDocument();
  });
});
