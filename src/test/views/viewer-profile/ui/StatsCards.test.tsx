import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ViewerProfileStats } from "@/entities/viewer";
import { StatsCards } from "@/views/viewer-profile/ui/StatsCards";

function createStats(overrides: Partial<ViewerProfileStats> = {}): ViewerProfileStats {
  return {
    eloRating: 1532,
    globalRank: 120,
    globalPlayersCount: 3_000,
    regionalRank: 10,
    regionalPlayersCount: 400,
    winRate: 0.625,
    totalMatches: 40,
    wins: 25,
    losses: 10,
    draws: 5,
    avgSolutionTimeSeconds: 125,
    maxWinStreak: 3,
    ...overrides,
  };
}

describe("views/viewer-profile/ui/StatsCards", () => {
  it("renders formatted stat cards with value and meta information", () => {
    const { container } = render(<StatsCards stats={createStats()} />);

    expect(screen.getByText("Current Elo")).toBeInTheDocument();
    expect(screen.getByText("1,532")).toBeInTheDocument();
    expect(screen.getByText("Rated Winrate")).toBeInTheDocument();
    expect(screen.getByText("62.5%")).toBeInTheDocument();
    expect(screen.getByText("25W / 10L / 5D (rated)")).toBeInTheDocument();
    expect(screen.getByText("Avg Time")).toBeInTheDocument();
    expect(screen.getByText("2:05")).toBeInTheDocument();
    expect(screen.getByText("Streak")).toBeInTheDocument();
    expect(screen.getByText("3 Wins")).toBeInTheDocument();

    expect(container.querySelectorAll("article")).toHaveLength(4);
  });

  it("renders no-data average time and singular streak grammar", () => {
    render(
      <StatsCards
        stats={createStats({
          avgSolutionTimeSeconds: null,
          maxWinStreak: 1,
        })}
      />,
    );

    expect(screen.getByText("No data yet")).toBeInTheDocument();
    expect(
      screen.getByText("Submission timing will appear after solved tasks."),
    ).toBeInTheDocument();
    expect(screen.getByText("1 Win")).toBeInTheDocument();
  });
});
