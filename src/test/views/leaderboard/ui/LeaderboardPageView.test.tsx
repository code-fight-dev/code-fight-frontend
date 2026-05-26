import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { LeaderboardEntry, LeaderboardPage } from "@/entities/leaderboard";
import { LeaderboardPageView } from "@/views/leaderboard/ui/LeaderboardPageView";

const leaderboardViewMocks = vi.hoisted(() => ({
  useLeaderboardNavigation: vi.fn(),
}));

vi.mock("@/features/leaderboard-navigation", () => ({
  useLeaderboardNavigation: leaderboardViewMocks.useLeaderboardNavigation,
}));

vi.mock("@/shared/ui/AmbientGrid", () => ({
  AmbientGrid: ({ className }: { className?: string }) => (
    <div data-testid="ambient-grid" className={className} />
  ),
}));

vi.mock("@/shared/ui/Container", () => ({
  Container: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/widgets/leaderboard-hero", () => ({
  LeaderboardHero: ({
    stats,
    totalPlayers,
  }: {
    stats?: unknown;
    totalPlayers: number;
  }) => (
    <div data-testid="leaderboard-hero">{`${totalPlayers}:${stats ? "has-stats" : "no-stats"}`}</div>
  ),
}));

vi.mock("@/widgets/leaderboard-podium", () => ({
  LeaderboardPodium: ({ items }: { items: LeaderboardEntry[] }) => (
    <div data-testid="leaderboard-podium">{items.length}</div>
  ),
}));

vi.mock("@/widgets/leaderboard-ranking", () => ({
  LeaderboardRanking: ({
    viewerUserId,
    query,
    currentPage,
    totalPages,
    items,
  }: {
    viewerUserId: string | null;
    query: string;
    currentPage: number;
    totalPages: number;
    items: LeaderboardEntry[];
  }) => (
    <div data-testid="leaderboard-ranking">
      {`${viewerUserId ?? "none"}|${query}|${currentPage}/${totalPages}|${items.length}`}
    </div>
  ),
}));

function createEntry(rank: number, userId: string): LeaderboardEntry {
  return {
    rank,
    userId,
    username: `user-${rank}`,
    displayName: `User ${rank}`,
    avatarUrl: "",
    country: "United States",
    countryCode: "US",
    rating: 1500 + rank,
    ratedGames: 100 + rank,
    wins: 50 + rank,
    losses: 40,
    draws: 10,
    winRate: 55.5,
  };
}

function createPage(overrides: Partial<LeaderboardPage> = {}): LeaderboardPage {
  return {
    mode: "global",
    limit: 10,
    offset: 0,
    total: 100,
    items: [createEntry(1, "u1"), createEntry(2, "u2")],
    viewerRank: createEntry(11, "viewer-1"),
    stats: {
      rankedPlayers: 100,
      matchesToday: 200,
      averageDailyMatches: 150,
      matchesTodayGrowthPercent: 10,
      cachedAt: "2026-05-25T00:00:00.000Z",
    },
    ...overrides,
  };
}

describe("views/leaderboard/ui/LeaderboardPageView", () => {
  it("wires leaderboard navigation and passes resolved props to child widgets", () => {
    leaderboardViewMocks.useLeaderboardNavigation.mockReturnValue({
      query: "alice",
      visibleItems: [createEntry(1, "u1")],
      page: 2,
      totalPages: 5,
      setQuery: vi.fn(),
      goToEntry: vi.fn(),
      goToPrevPage: vi.fn(),
      goToNextPage: vi.fn(),
      canGoPrevPage: true,
      canGoNextPage: true,
    });

    const page = createPage();
    const podiumItems = [
      createEntry(1, "u1"),
      createEntry(2, "u2"),
      createEntry(3, "u3"),
    ];

    render(<LeaderboardPageView page={page} podiumItems={podiumItems} />);

    expect(leaderboardViewMocks.useLeaderboardNavigation).toHaveBeenCalledWith({
      items: page.items,
      viewerRank: page.viewerRank,
      pageSize: page.limit,
      pageOffset: page.offset,
      totalItems: page.total,
    });

    expect(screen.getByTestId("leaderboard-hero")).toHaveTextContent("100:has-stats");
    expect(screen.getByTestId("leaderboard-podium")).toHaveTextContent("3");
    expect(screen.getByTestId("leaderboard-ranking")).toHaveTextContent(
      "viewer-1|alice|2/5|1",
    );
  });

  it("passes null viewer user id when viewer rank is missing", () => {
    leaderboardViewMocks.useLeaderboardNavigation.mockReturnValue({
      query: "",
      visibleItems: [],
      page: 1,
      totalPages: 1,
      setQuery: vi.fn(),
      goToEntry: vi.fn(),
      goToPrevPage: vi.fn(),
      goToNextPage: vi.fn(),
      canGoPrevPage: false,
      canGoNextPage: false,
    });

    render(
      <LeaderboardPageView
        page={createPage({ viewerRank: undefined, stats: undefined })}
        podiumItems={[]}
      />,
    );

    expect(screen.getByTestId("leaderboard-hero")).toHaveTextContent("100:no-stats");
    expect(screen.getByTestId("leaderboard-ranking")).toHaveTextContent("none||1/1|0");
  });
});
