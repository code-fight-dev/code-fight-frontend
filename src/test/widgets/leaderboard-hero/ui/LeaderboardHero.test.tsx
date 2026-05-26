import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatInteger, type LeaderboardStats } from "@/entities/leaderboard";
import { LeaderboardHero } from "@/widgets/leaderboard-hero";

describe("LeaderboardHero", () => {
  it("renders leaderboard hero content and stats cards", () => {
    const stats = {
      rankedPlayers: 1284,
      matchesToday: 73,
    } as LeaderboardStats;

    render(<LeaderboardHero stats={stats} totalPlayers={999} />);

    expect(
      screen.getByRole("heading", {
        name: "Global Ranking",
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Leaderboard")).toBeInTheDocument();

    expect(
      screen.getByText(
        "The sharpest minds across the arena. Climb the rating, claim your spot, and push for the top.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Rank Guide",
      }),
    ).toHaveAttribute("href", "/ranking");

    expect(screen.getByText("Players")).toBeInTheDocument();
    expect(screen.getByText(formatInteger(1284))).toBeInTheDocument();
    expect(screen.getByText("ranked in global mode")).toBeInTheDocument();

    expect(screen.getByText("Matches Today")).toBeInTheDocument();
    expect(screen.getByText(formatInteger(73))).toBeInTheDocument();
    expect(screen.getByText("live public stats")).toBeInTheDocument();
  });

  it("uses total players and unavailable matches when stats are missing", () => {
    render(<LeaderboardHero totalPlayers={4200} />);

    expect(screen.getByText(formatInteger(4200))).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("stats unavailable")).toBeInTheDocument();
  });

  it("normalizes non-finite and negative stat values", () => {
    const stats = {
      rankedPlayers: Number.NaN,
      matchesToday: -12,
    } as LeaderboardStats;

    render(<LeaderboardHero stats={stats} totalPlayers={100} />);

    const zeroValues = screen.getAllByText(formatInteger(0));

    expect(zeroValues).toHaveLength(2);
  });
});
