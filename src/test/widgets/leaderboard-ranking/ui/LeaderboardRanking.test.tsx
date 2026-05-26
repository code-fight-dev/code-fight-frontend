import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LeaderboardEntry } from "@/entities/leaderboard";
import { LeaderboardRanking } from "@/widgets/leaderboard-ranking";

const leaderboardRankingMocks = vi.hoisted(() => ({
  useLeaderboardEntryFocus: vi.fn(),
}));

vi.mock("@/entities/leaderboard", () => ({
  formatInteger: (value: number) => value.toLocaleString("en-US"),
  formatWLD: (entry: LeaderboardEntry) =>
    `${entry.wins} / ${entry.losses} / ${entry.draws}`,
  formatWinRate: (value: number) => `${Math.round(value * 100)}%`,
  getEntryGames: (entry: LeaderboardEntry) => entry.ratedGames,
  PlayerIdentity: ({
    entry,
    isViewer = false,
  }: {
    entry: LeaderboardEntry;
    isViewer?: boolean;
  }) => (
    <div data-testid={`player-identity-${entry.userId}`} data-viewer={String(isViewer)}>
      {entry.displayName}
    </div>
  ),
  TierBadge: ({ entry }: { entry: LeaderboardEntry }) => (
    <div data-testid={`tier-badge-${entry.userId}`}>Tier {entry.rank}</div>
  ),
  LeaderboardAvatar: ({ username }: { username: string }) => (
    <div data-testid={`leaderboard-avatar-${username}`}>{username}</div>
  ),
}));

vi.mock("@/features/leaderboard-focus", () => ({
  useLeaderboardEntryFocus: leaderboardRankingMocks.useLeaderboardEntryFocus,
  LeaderboardJumpToMeButton: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      Jump to me
    </button>
  ),
}));

vi.mock("@/features/leaderboard-navigation", () => ({
  LeaderboardSearchInput: ({
    query,
    onQueryChange,
  }: {
    query: string;
    onQueryChange: (value: string) => void;
  }) => (
    <label>
      Search players
      <input
        aria-label="Search players"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </label>
  ),
  LeaderboardPaginationControls: ({
    currentPage,
    totalPages,
    canGoPrevPage,
    canGoNextPage,
    onPrevPage,
    onNextPage,
  }: {
    currentPage: number;
    totalPages: number;
    canGoPrevPage: boolean;
    canGoNextPage: boolean;
    onPrevPage: () => void;
    onNextPage: () => void;
  }) => (
    <div data-testid="pagination-controls" data-page={`${currentPage}/${totalPages}`}>
      <button type="button" disabled={!canGoPrevPage} onClick={onPrevPage}>
        Prev page
      </button>
      <button type="button" disabled={!canGoNextPage} onClick={onNextPage}>
        Next page
      </button>
    </div>
  ),
}));

function createEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    rank: 1,
    userId: "user-1",
    username: "alpha",
    displayName: "Alpha",
    avatarUrl: "https://example.com/avatar.png",
    country: "United States",
    countryCode: "US",
    rating: 2100,
    ratedGames: 120,
    wins: 70,
    losses: 40,
    draws: 10,
    winRate: 0.67,
    ...overrides,
  };
}

describe("widgets/leaderboard-ranking/ui/LeaderboardRanking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ranking tables, viewer bar and integrates search/pagination/actions", () => {
    const handleJumpToMe = vi.fn();
    const setQuery = vi.fn();
    const goToPrevPage = vi.fn();
    const goToNextPage = vi.fn();
    const goToEntry = vi.fn(() => true);

    leaderboardRankingMocks.useLeaderboardEntryFocus.mockReturnValue({
      focusedUserId: "user-2",
      handleJumpToMe,
    });

    const items = [
      createEntry({
        rank: 1,
        userId: "user-1",
        username: "alpha",
        displayName: "Alpha",
        rating: 2400,
        ratedGames: 180,
        wins: 110,
        losses: 60,
        draws: 10,
        winRate: 0.72,
      }),
      createEntry({
        rank: 2,
        userId: "user-2",
        username: "bravo",
        displayName: "Bravo",
        rating: 2100,
        ratedGames: 120,
        wins: 70,
        losses: 40,
        draws: 10,
        winRate: 0.67,
      }),
    ];

    render(
      <LeaderboardRanking
        items={items}
        viewerRank={items[1]}
        viewerUserId="user-2"
        query="br"
        totalCount={2000}
        loadedCount={120}
        currentPage={2}
        totalPages={5}
        setQuery={setQuery}
        goToPrevPage={goToPrevPage}
        goToNextPage={goToNextPage}
        canGoPrevPage={true}
        canGoNextPage={false}
        goToEntry={goToEntry}
      />,
    );

    expect(screen.getByRole("heading", { name: "Ranking" })).toBeInTheDocument();
    expect(
      screen.getByText(/Total 2,000 players \| Showing 2 of 120 loaded this page/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Search players")).toHaveValue("br");

    fireEvent.change(screen.getByLabelText("Search players"), {
      target: { value: "bravo" },
    });
    expect(setQuery).toHaveBeenCalledWith("bravo");

    const desktopRowFirst = document.getElementById("leaderboard-entry-desktop-user-1");
    const desktopRowSecond = document.getElementById("leaderboard-entry-desktop-user-2");
    const mobileRowSecond = document.getElementById("leaderboard-entry-mobile-user-2");

    expect(desktopRowFirst).not.toHaveClass("border-t");
    expect(desktopRowSecond).toHaveClass(
      "border-t",
      "border-(--app-surface-strong-border)",
    );
    expect(desktopRowSecond).toHaveClass("ring-1", "ring-slate-300/60", "ring-inset");
    expect(mobileRowSecond).toHaveClass("ring-1", "ring-slate-300/60");

    screen.getAllByTestId("player-identity-user-1").forEach((element) => {
      expect(element).toHaveAttribute("data-viewer", "false");
    });
    screen.getAllByTestId("player-identity-user-2").forEach((element) => {
      expect(element).toHaveAttribute("data-viewer", "true");
    });

    expect(screen.getByText("Your Rank")).toBeInTheDocument();
    expect(screen.getByText("2,100 rating - 67% winrate")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Jump to me" }));
    expect(handleJumpToMe).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId("pagination-controls")).toHaveAttribute("data-page", "2/5");
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Prev page" }));
    expect(goToPrevPage).toHaveBeenCalledTimes(1);
    expect(goToNextPage).not.toHaveBeenCalled();

    expect(leaderboardRankingMocks.useLeaderboardEntryFocus).toHaveBeenCalledWith(
      expect.objectContaining({
        goToEntry,
        viewerUserId: "user-2",
      }),
    );
  });

  it("does not render viewer rank bar and focus rings when rank and focus are absent", () => {
    const goToEntry = vi.fn(() => false);

    leaderboardRankingMocks.useLeaderboardEntryFocus.mockReturnValue({
      focusedUserId: null,
      handleJumpToMe: vi.fn(),
    });

    render(
      <LeaderboardRanking
        items={[createEntry()]}
        viewerUserId={null}
        query=""
        totalCount={1500}
        loadedCount={40}
        currentPage={1}
        totalPages={4}
        setQuery={vi.fn()}
        goToPrevPage={vi.fn()}
        goToNextPage={vi.fn()}
        canGoPrevPage={false}
        canGoNextPage={true}
        goToEntry={goToEntry}
      />,
    );

    const desktopRow = document.getElementById("leaderboard-entry-desktop-user-1");
    const mobileRow = document.getElementById("leaderboard-entry-mobile-user-1");

    expect(screen.queryByText("Your Rank")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Jump to me" })).not.toBeInTheDocument();
    expect(desktopRow).not.toHaveClass("ring-1");
    expect(mobileRow).not.toHaveClass("ring-1");

    screen.getAllByTestId("player-identity-user-1").forEach((element) => {
      expect(element).toHaveAttribute("data-viewer", "false");
    });
  });
});
