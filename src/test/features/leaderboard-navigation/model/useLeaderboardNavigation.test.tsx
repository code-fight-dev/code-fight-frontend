import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LeaderboardEntry } from "@/entities/leaderboard";
import { useLeaderboardNavigation } from "@/features/leaderboard-navigation/model/useLeaderboardNavigation";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: "/leaderboard",
  searchParams: "mode=global&page=3&limit=25&offset=50",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigationMocks.push,
  }),
  usePathname: () => navigationMocks.pathname,
  useSearchParams: () => new URLSearchParams(navigationMocks.searchParams),
}));

function createEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    rank: 1,
    userId: "user-1",
    username: "alice",
    displayName: "Alice",
    avatarUrl: "https://example.com/a.png",
    country: "United States",
    countryCode: "US",
    rating: 1500,
    ratedGames: 100,
    wins: 60,
    losses: 30,
    draws: 10,
    winRate: 0.6,
    ...overrides,
  };
}

function readPushedSearchParams() {
  const pushUrl = navigationMocks.push.mock.calls[0]?.[0];
  const parsed = new URL(String(pushUrl), "https://example.test");
  return {
    pathname: parsed.pathname,
    params: parsed.searchParams,
  };
}

describe("features/leaderboard-navigation/model/useLeaderboardNavigation", () => {
  beforeEach(() => {
    navigationMocks.push.mockReset();
    navigationMocks.pathname = "/leaderboard";
    navigationMocks.searchParams = "mode=global&page=3&limit=25&offset=50";
  });

  it("calculates page metadata and filters visible items by normalized query", () => {
    const items = [
      createEntry({
        rank: 51,
        userId: "alice-id",
        username: "alice",
        displayName: "Alice Pro",
      }),
      createEntry({
        rank: 52,
        userId: "bob-id",
        username: "bob",
        displayName: "Bob",
      }),
    ];

    const { result } = renderHook(() =>
      useLeaderboardNavigation({
        items,
        pageSize: 25,
        pageOffset: 50,
        totalItems: 100,
      }),
    );

    expect(result.current.page).toBe(3);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.canGoPrevPage).toBe(true);
    expect(result.current.canGoNextPage).toBe(true);
    expect(result.current.visibleItems.map((entry) => entry.userId)).toEqual([
      "alice-id",
      "bob-id",
    ]);

    act(() => {
      result.current.setQuery("  ALICE ");
    });

    expect(result.current.query).toBe("  ALICE ");
    expect(result.current.visibleItems.map((entry) => entry.userId)).toEqual([
      "alice-id",
    ]);
  });

  it("navigates to previous and next pages with normalized query params", () => {
    const items = [
      createEntry(),
      createEntry({ rank: 2, userId: "user-2", username: "bob" }),
    ];

    const { result } = renderHook(() =>
      useLeaderboardNavigation({
        items,
        pageSize: 25,
        pageOffset: 50,
        totalItems: 100,
      }),
    );

    act(() => {
      result.current.goToPrevPage();
    });

    let pushed = readPushedSearchParams();
    expect(pushed.pathname).toBe("/leaderboard");
    expect(pushed.params.get("page")).toBe("2");
    expect(pushed.params.get("pageSize")).toBe("25");
    expect(pushed.params.get("mode")).toBe("global");
    expect(pushed.params.has("limit")).toBe(false);
    expect(pushed.params.has("offset")).toBe(false);

    navigationMocks.push.mockReset();

    act(() => {
      result.current.goToNextPage();
    });

    pushed = readPushedSearchParams();
    expect(pushed.pathname).toBe("/leaderboard");
    expect(pushed.params.get("page")).toBe("4");
    expect(pushed.params.get("pageSize")).toBe("25");
    expect(pushed.params.get("mode")).toBe("global");
  });

  it("does not navigate when requested page resolves to current page", () => {
    const items = [createEntry()];

    const { result } = renderHook(() =>
      useLeaderboardNavigation({
        items,
        pageSize: 25,
        pageOffset: 0,
        totalItems: 1,
      }),
    );

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.canGoPrevPage).toBe(false);
    expect(result.current.canGoNextPage).toBe(false);

    act(() => {
      result.current.goToPrevPage();
      result.current.goToNextPage();
    });

    expect(navigationMocks.push).not.toHaveBeenCalled();
  });

  it("finds visible item without navigation", () => {
    const items = [
      createEntry({ userId: "alice-id", displayName: "Alice", username: "alice" }),
      createEntry({ userId: "bob-id", displayName: "Bob", username: "bob" }),
    ];

    const { result } = renderHook(() =>
      useLeaderboardNavigation({
        items,
        pageSize: 25,
        pageOffset: 0,
        totalItems: 100,
      }),
    );

    act(() => {
      result.current.setQuery("alice");
    });

    const isFound = result.current.goToEntry("alice-id");
    expect(isFound).toBe(true);
    expect(result.current.query).toBe("alice");
    expect(navigationMocks.push).not.toHaveBeenCalled();
  });

  it("clears query when item exists on page but hidden by filter", () => {
    const items = [
      createEntry({ userId: "alice-id", displayName: "Alice", username: "alice" }),
      createEntry({ userId: "bob-id", displayName: "Bob", username: "bob" }),
    ];

    const { result } = renderHook(() =>
      useLeaderboardNavigation({
        items,
        pageSize: 25,
        pageOffset: 0,
        totalItems: 100,
      }),
    );

    act(() => {
      result.current.setQuery("alice");
    });

    let isFound = false;
    act(() => {
      isFound = result.current.goToEntry("bob-id");
    });
    expect(isFound).toBe(true);
    expect(result.current.query).toBe("");
    expect(navigationMocks.push).not.toHaveBeenCalled();
  });

  it("uses viewer rank to navigate to user page when user is outside current page", () => {
    const items = [
      createEntry({ userId: "alice-id", displayName: "Alice", username: "alice" }),
      createEntry({ userId: "bob-id", displayName: "Bob", username: "bob" }),
    ];
    const viewerRank = createEntry({
      rank: 61,
      userId: "viewer-id",
      username: "viewer",
      displayName: "Viewer",
    });

    const { result } = renderHook(() =>
      useLeaderboardNavigation({
        items,
        viewerRank,
        pageSize: 25,
        pageOffset: 0,
        totalItems: 200,
      }),
    );

    act(() => {
      result.current.setQuery("alice");
    });

    let isFound = false;
    act(() => {
      isFound = result.current.goToEntry("viewer-id");
    });
    expect(isFound).toBe(true);
    expect(result.current.query).toBe("");
    expect(navigationMocks.push).toHaveBeenCalledTimes(1);

    const pushed = readPushedSearchParams();
    expect(pushed.params.get("page")).toBe("3");
    expect(pushed.params.get("pageSize")).toBe("25");
  });

  it("returns false when user cannot be found in page items or viewer rank", () => {
    const items = [createEntry({ userId: "alice-id" })];

    const { result } = renderHook(() =>
      useLeaderboardNavigation({
        items,
        pageSize: 25,
        pageOffset: 0,
        totalItems: 50,
      }),
    );

    const isFound = result.current.goToEntry("missing-id");
    expect(isFound).toBe(false);
    expect(navigationMocks.push).not.toHaveBeenCalled();
  });
});
