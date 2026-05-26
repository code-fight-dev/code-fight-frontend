import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LeaderboardEntry, LeaderboardPage } from "@/entities/leaderboard";
import { getLeaderboardPage } from "@/entities/leaderboard/server";
import { getLeaderboardViewData } from "@/views/leaderboard/server";

vi.mock("server-only", () => ({}));

vi.mock("@/entities/leaderboard/server", () => ({
  getLeaderboardPage: vi.fn(),
}));

const mockedGetLeaderboardPage = vi.mocked(getLeaderboardPage);

function createEntry(id: string): LeaderboardEntry {
  return {
    id,
    username: `player-${id}`,
    score: Number(id),
  } as unknown as LeaderboardEntry;
}

function createEntries(count: number, prefix = "player") {
  return Array.from({ length: count }, (_, index) =>
    createEntry(`${prefix}-${index + 1}`),
  );
}

function createPage({
  items,
  total = items.length,
  limit = 10,
  offset = 0,
}: {
  items: LeaderboardEntry[];
  total?: number;
  limit?: number;
  offset?: number;
}): LeaderboardPage {
  return {
    items,
    total,
    limit,
    offset,
  } as unknown as LeaderboardPage;
}

describe("views/leaderboard/server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the default global leaderboard page and uses first page items for podium", async () => {
    const items = createEntries(5);
    const page = createPage({
      items,
      total: 5,
      limit: 10,
      offset: 0,
    });

    mockedGetLeaderboardPage.mockResolvedValue(page);

    await expect(getLeaderboardViewData()).resolves.toEqual({
      page,
      podiumItems: items.slice(0, 3),
    });

    expect(mockedGetLeaderboardPage).toHaveBeenCalledTimes(1);
    expect(mockedGetLeaderboardPage).toHaveBeenCalledWith({
      mode: "global",
      page: 1,
      pageSize: 10,
    });
  });

  it("loads dedicated podium page when first page has fewer than three items", async () => {
    const firstPage = createPage({
      items: createEntries(2, "short"),
      total: 2,
      limit: 10,
      offset: 0,
    });

    const podiumItems = createEntries(4, "podium");
    const podiumPage = createPage({
      items: podiumItems,
      total: 4,
      limit: 3,
      offset: 0,
    });

    mockedGetLeaderboardPage
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(podiumPage);

    await expect(getLeaderboardViewData()).resolves.toEqual({
      page: firstPage,
      podiumItems: podiumItems.slice(0, 3),
    });

    expect(mockedGetLeaderboardPage).toHaveBeenNthCalledWith(2, {
      mode: "global",
      page: 1,
      pageSize: 3,
    });
  });

  it("reloads the last available page when requested page is greater than total pages", async () => {
    const oversizedPage = createPage({
      items: [],
      total: 15,
      limit: 10,
      offset: 980,
    });

    const lastPage = createPage({
      items: createEntries(5, "last"),
      total: 15,
      limit: 10,
      offset: 10,
    });

    const podiumItems = createEntries(4, "podium");
    const podiumPage = createPage({
      items: podiumItems,
      total: 15,
      limit: 3,
      offset: 0,
    });

    mockedGetLeaderboardPage
      .mockResolvedValueOnce(oversizedPage)
      .mockResolvedValueOnce(lastPage)
      .mockResolvedValueOnce(podiumPage);

    await expect(
      getLeaderboardViewData({
        page: 99,
        pageSize: 10,
      }),
    ).resolves.toEqual({
      page: lastPage,
      podiumItems: podiumItems.slice(0, 3),
    });

    expect(mockedGetLeaderboardPage).toHaveBeenNthCalledWith(1, {
      mode: "global",
      page: 99,
      pageSize: 10,
    });

    expect(mockedGetLeaderboardPage).toHaveBeenNthCalledWith(2, {
      mode: "global",
      page: 2,
      pageSize: 10,
    });

    expect(mockedGetLeaderboardPage).toHaveBeenNthCalledWith(3, {
      mode: "global",
      page: 1,
      pageSize: 3,
    });
  });

  it("normalizes invalid page and page size values to defaults", async () => {
    const page = createPage({
      items: createEntries(3),
      total: 3,
      limit: 10,
      offset: 0,
    });

    mockedGetLeaderboardPage.mockResolvedValue(page);

    await getLeaderboardViewData({
      mode: "season",
      page: "invalid" as unknown as number,
      pageSize: Number.NaN,
    });

    expect(mockedGetLeaderboardPage).toHaveBeenCalledWith({
      mode: "season",
      page: 1,
      pageSize: 10,
    });
  });

  it("normalizes negative page and non-positive page size values", async () => {
    const page = createPage({
      items: createEntries(3),
      total: 3,
      limit: 10,
      offset: 0,
    });

    mockedGetLeaderboardPage.mockResolvedValue(page);

    await getLeaderboardViewData({
      mode: "weekly",
      page: -3.7,
      pageSize: 0,
    });

    expect(mockedGetLeaderboardPage).toHaveBeenCalledWith({
      mode: "weekly",
      page: 1,
      pageSize: 10,
    });
  });

  it("floors page values, caps page size and loads podium from the first page when current page is not first", async () => {
    const currentPage = createPage({
      items: createEntries(5, "current"),
      total: 250,
      limit: 100,
      offset: 100,
    });

    const podiumItems = createEntries(5, "podium");
    const podiumPage = createPage({
      items: podiumItems,
      total: 250,
      limit: 3,
      offset: 0,
    });

    mockedGetLeaderboardPage
      .mockResolvedValueOnce(currentPage)
      .mockResolvedValueOnce(podiumPage);

    await expect(
      getLeaderboardViewData({
        mode: "friends",
        page: 2.8,
        pageSize: 250.8,
      }),
    ).resolves.toEqual({
      page: currentPage,
      podiumItems: podiumItems.slice(0, 3),
    });

    expect(mockedGetLeaderboardPage).toHaveBeenNthCalledWith(1, {
      mode: "friends",
      page: 2,
      pageSize: 100,
    });

    expect(mockedGetLeaderboardPage).toHaveBeenNthCalledWith(2, {
      mode: "friends",
      page: 1,
      pageSize: 3,
    });
  });
});
