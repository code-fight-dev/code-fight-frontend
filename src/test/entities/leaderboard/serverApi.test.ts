import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LeaderboardEntry, LeaderboardPage } from "@/entities/leaderboard";

const serverMocks = vi.hoisted(() => ({
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: serverMocks.headers,
}));

function createEntry(
  username: string,
  overrides: Partial<LeaderboardEntry> = {},
): LeaderboardEntry {
  return {
    rank: 1,
    userId: `user-${username}`,
    username,
    displayName: username,
    avatarUrl: "",
    country: "United States",
    countryCode: "US",
    rating: 1500,
    ratedGames: 20,
    wins: 10,
    losses: 8,
    draws: 2,
    winRate: 0.5,
    ...overrides,
  };
}

function createPage(overrides: Partial<LeaderboardPage> = {}): LeaderboardPage {
  return {
    mode: "global",
    limit: 100,
    offset: 0,
    total: 1,
    items: [createEntry("alice")],
    ...overrides,
  };
}

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function importLeaderboardServerApi() {
  vi.resetModules();
  return import("@/entities/leaderboard/server");
}

describe("leaderboard server api", () => {
  beforeEach(() => {
    serverMocks.headers.mockReset();
    serverMocks.headers.mockResolvedValue(new Headers());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fetches leaderboard page with query params and cookie header", async () => {
    const page = createPage();
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(page));
    vi.stubGlobal("fetch", fetchMock);
    serverMocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));

    const { getLeaderboardPage } = await importLeaderboardServerApi();
    const result = await getLeaderboardPage({
      mode: " global ",
      pageSize: 25,
      offset: 50,
      page: 2,
    });

    expect(result).toEqual(page);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/leaderboard?mode=global&pageSize=25&offset=50&page=2",
      ),
      {
        method: "GET",
        headers: {
          cookie: "session=token",
        },
        cache: "no-store",
      },
    );
  });

  it("prefers limit over pageSize and omits headers when cookie is absent", async () => {
    const page = createPage();
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(page));
    vi.stubGlobal("fetch", fetchMock);

    const { getLeaderboardPage } = await importLeaderboardServerApi();
    await getLeaderboardPage({
      mode: "global",
      limit: 100,
      pageSize: 25,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/leaderboard?mode=global&limit=100");
    expect(url).not.toContain("pageSize");
    expect(init.headers).toBeUndefined();
  });

  it("throws when leaderboard request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getLeaderboardPage } = await importLeaderboardServerApi();

    await expect(getLeaderboardPage()).rejects.toThrow("Failed to fetch leaderboard");
  });

  it("throws when leaderboard response is invalid JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("not-json", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { getLeaderboardPage } = await importLeaderboardServerApi();

    await expect(getLeaderboardPage()).rejects.toThrow("Invalid leaderboard response");
  });

  it("throws when leaderboard response shape is invalid", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ mode: "global", items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const { getLeaderboardPage } = await importLeaderboardServerApi();

    await expect(getLeaderboardPage()).rejects.toThrow("Invalid leaderboard response");
  });

  it("returns null for blank username in rated winrate lookup", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getRatedWinrateByUsername } = await importLeaderboardServerApi();
    const result = await getRatedWinrateByUsername("   ");

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns hit from rank page when globalRank page contains user", async () => {
    const target = createEntry("alice", {
      rank: 151,
      winRate: 0.72,
      wins: 72,
      losses: 20,
      draws: 8,
      ratedGames: 100,
    });
    const rankPage = createPage({
      offset: 100,
      total: 300,
      items: [target],
    });
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(rankPage));
    vi.stubGlobal("fetch", fetchMock);

    const { getRatedWinrateByUsername } = await importLeaderboardServerApi();
    const result = await getRatedWinrateByUsername(" Alice ", {
      mode: "global",
      globalRank: 151,
    });

    expect(result).toEqual({
      winRate: 0.72,
      wins: 72,
      losses: 20,
      draws: 8,
      ratedGames: 100,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/leaderboard?mode=global&limit=100&offset=100"),
      expect.any(Object),
    );
  });

  it("falls back to first page viewerRank when rank page miss happens", async () => {
    const rankPage = createPage({
      offset: 100,
      total: 300,
      items: [createEntry("bob", { rank: 101 })],
    });
    const viewerRank = createEntry("alice", {
      rank: 225,
      winRate: 0.6,
      wins: 30,
      losses: 18,
      draws: 2,
      ratedGames: 50,
    });
    const firstPage = createPage({
      offset: 0,
      total: 300,
      items: [createEntry("bob", { rank: 1 })],
      viewerRank,
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse(rankPage))
      .mockResolvedValueOnce(createJsonResponse(firstPage));
    vi.stubGlobal("fetch", fetchMock);

    const { getRatedWinrateByUsername } = await importLeaderboardServerApi();
    const result = await getRatedWinrateByUsername("alice", {
      globalRank: 150,
    });

    expect(result).toEqual({
      winRate: 0.6,
      wins: 30,
      losses: 18,
      draws: 2,
      ratedGames: 50,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns hit from first page items when viewerRank does not match", async () => {
    const firstPage = createPage({
      items: [createEntry("alice", { wins: 11, losses: 5, draws: 4, ratedGames: 20 })],
      viewerRank: createEntry("bob"),
    });
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(firstPage));
    vi.stubGlobal("fetch", fetchMock);

    const { getRatedWinrateByUsername } = await importLeaderboardServerApi();
    const result = await getRatedWinrateByUsername("alice");

    expect(result).toEqual({
      winRate: 0.5,
      wins: 11,
      losses: 5,
      draws: 4,
      ratedGames: 20,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/leaderboard?mode=global&limit=100&offset=0"),
      expect.any(Object),
    );
  });

  it("searches subsequent pages when first page has no target", async () => {
    const firstPage = createPage({
      total: 220,
      offset: 0,
      items: [createEntry("bob", { rank: 1 })],
    });
    const secondPage = createPage({
      total: 220,
      offset: 100,
      items: [
        createEntry("alice", {
          rank: 150,
          wins: 40,
          losses: 10,
          draws: 0,
          ratedGames: 50,
        }),
      ],
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse(firstPage))
      .mockResolvedValueOnce(createJsonResponse(secondPage));
    vi.stubGlobal("fetch", fetchMock);

    const { getRatedWinrateByUsername } = await importLeaderboardServerApi();
    const result = await getRatedWinrateByUsername("alice");

    expect(result).toEqual({
      winRate: 0.5,
      wins: 40,
      losses: 10,
      draws: 0,
      ratedGames: 50,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toContain("offset=100");
  });

  it("returns null when user is not found in any page", async () => {
    const firstPage = createPage({
      total: 180,
      offset: 0,
      items: [createEntry("bob", { rank: 1 })],
    });
    const secondPage = createPage({
      total: 180,
      offset: 100,
      items: [createEntry("carol", { rank: 101 })],
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse(firstPage))
      .mockResolvedValueOnce(createJsonResponse(secondPage));
    vi.stubGlobal("fetch", fetchMock);

    const { getRatedWinrateByUsername } = await importLeaderboardServerApi();
    const result = await getRatedWinrateByUsername("alice");

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
