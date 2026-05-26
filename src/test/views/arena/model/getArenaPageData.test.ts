import { beforeEach, describe, expect, it, vi } from "vitest";

import { getRatedWinrateByUsername } from "@/entities/leaderboard/server";
import { getRankByRating } from "@/entities/rank";
import { getViewerProfile } from "@/entities/viewer";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { getArenaPageData } from "@/views/arena/model/getArenaPageData";

vi.mock("server-only", () => ({}));

vi.mock("@/entities/leaderboard/server", () => ({
  getRatedWinrateByUsername: vi.fn(),
}));

vi.mock("@/entities/viewer", () => ({
  getViewerProfile: vi.fn(),
}));

vi.mock("@/entities/viewer/server", () => ({
  getCurrentViewerServer: vi.fn(),
}));

const mockedGetCurrentViewerServer = vi.mocked(getCurrentViewerServer);
const mockedGetViewerProfile = vi.mocked(getViewerProfile);
const mockedGetRatedWinrateByUsername = vi.mocked(getRatedWinrateByUsername);

type Viewer = NonNullable<Awaited<ReturnType<typeof getCurrentViewerServer>>>;
type ViewerProfile = NonNullable<Awaited<ReturnType<typeof getViewerProfile>>>;

function createViewer(username = "lyosh"): Viewer {
  return {
    username,
  } as Viewer;
}

function createProfile(): ViewerProfile {
  return {
    username: "lyosh",
    avatarUrl: "https://cdn.example.com/avatar.png",
    stats: {
      eloRating: 1420,
      globalRank: 17,
      totalMatches: 42,
      winRate: 61,
      wins: 26,
      maxWinStreak: 8,
    },
  } as ViewerProfile;
}

describe("views/arena/model/getArenaPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns anonymous arena data when there is no current viewer", async () => {
    mockedGetCurrentViewerServer.mockResolvedValue(null);

    await expect(getArenaPageData()).resolves.toEqual({
      viewer: {
        username: null,
        avatarUrl: "",
        eloRating: null,
        globalRank: null,
        tier: null,
      },
      stats: null,
    });

    expect(mockedGetCurrentViewerServer).toHaveBeenCalledTimes(1);
    expect(mockedGetViewerProfile).not.toHaveBeenCalled();
    expect(mockedGetRatedWinrateByUsername).not.toHaveBeenCalled();
  });

  it("returns viewer identity without stats when profile is missing", async () => {
    mockedGetCurrentViewerServer.mockResolvedValue(createViewer("lyosh"));
    mockedGetViewerProfile.mockResolvedValue(null);

    await expect(getArenaPageData()).resolves.toEqual({
      viewer: {
        username: "lyosh",
        avatarUrl: "",
        eloRating: null,
        globalRank: null,
        tier: null,
      },
      stats: null,
    });

    expect(mockedGetCurrentViewerServer).toHaveBeenCalledTimes(1);
    expect(mockedGetViewerProfile).toHaveBeenCalledWith("lyosh");
    expect(mockedGetRatedWinrateByUsername).not.toHaveBeenCalled();
  });

  it("returns profile stats and rated winrate when available", async () => {
    const profile = createProfile();
    const expectedTier = getRankByRating(profile.stats.eloRating).tier;

    mockedGetCurrentViewerServer.mockResolvedValue(createViewer("lyosh"));
    mockedGetViewerProfile.mockResolvedValue(profile);
    mockedGetRatedWinrateByUsername.mockResolvedValue({
      winRate: 75,
    } as Awaited<ReturnType<typeof getRatedWinrateByUsername>>);

    await expect(getArenaPageData()).resolves.toEqual({
      viewer: {
        username: "lyosh",
        avatarUrl: "https://cdn.example.com/avatar.png",
        eloRating: 1420,
        globalRank: 17,
        tier: expectedTier,
      },
      stats: {
        totalMatches: 42,
        winRate: 75,
        wins: 26,
        maxWinStreak: 8,
      },
    });

    expect(mockedGetCurrentViewerServer).toHaveBeenCalledTimes(1);
    expect(mockedGetViewerProfile).toHaveBeenCalledWith("lyosh");

    expect(mockedGetRatedWinrateByUsername).toHaveBeenCalledWith("lyosh", {
      mode: "global",
      globalRank: 17,
    });
  });

  it("falls back to profile winrate when rated winrate is unavailable", async () => {
    const profile = createProfile();
    const expectedTier = getRankByRating(profile.stats.eloRating).tier;

    mockedGetCurrentViewerServer.mockResolvedValue(createViewer("lyosh"));
    mockedGetViewerProfile.mockResolvedValue(profile);
    mockedGetRatedWinrateByUsername.mockResolvedValue(null);

    await expect(getArenaPageData()).resolves.toEqual({
      viewer: {
        username: "lyosh",
        avatarUrl: "https://cdn.example.com/avatar.png",
        eloRating: 1420,
        globalRank: 17,
        tier: expectedTier,
      },
      stats: {
        totalMatches: 42,
        winRate: 61,
        wins: 26,
        maxWinStreak: 8,
      },
    });

    expect(mockedGetRatedWinrateByUsername).toHaveBeenCalledWith("lyosh", {
      mode: "global",
      globalRank: 17,
    });
  });
});
