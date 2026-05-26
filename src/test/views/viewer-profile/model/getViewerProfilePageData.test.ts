import { beforeEach, describe, expect, it, vi } from "vitest";

import { getRatedWinrateByUsername } from "@/entities/leaderboard/server";
import { getViewerProfile } from "@/entities/viewer";
import { createViewerProfileFixture } from "@/test/features/profile-settings/model/fixtures";
import { getViewerProfilePageData } from "@/views/viewer-profile/model/getViewerProfilePageData";

vi.mock("server-only", () => ({}));

vi.mock("@/entities/leaderboard/server", () => ({
  getRatedWinrateByUsername: vi.fn(),
}));

vi.mock("@/entities/viewer", () => ({
  getViewerProfile: vi.fn(),
}));

const mockedGetViewerProfile = vi.mocked(getViewerProfile);
const mockedGetRatedWinrateByUsername = vi.mocked(getRatedWinrateByUsername);

describe("views/viewer-profile/model/getViewerProfilePageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when profile does not exist", async () => {
    mockedGetViewerProfile.mockResolvedValue(null);

    await expect(getViewerProfilePageData("ghost")).resolves.toBeNull();

    expect(mockedGetViewerProfile).toHaveBeenCalledWith("ghost");
    expect(mockedGetRatedWinrateByUsername).not.toHaveBeenCalled();
  });

  it("returns original profile when rated winrate is unavailable", async () => {
    const profile = createViewerProfileFixture({
      username: "alice",
      stats: {
        globalRank: 55,
        winRate: 0.61,
        wins: 21,
        losses: 12,
        draws: 2,
      },
    });

    mockedGetViewerProfile.mockResolvedValue(profile);
    mockedGetRatedWinrateByUsername.mockResolvedValue(null);

    await expect(getViewerProfilePageData("alice")).resolves.toBe(profile);

    expect(mockedGetRatedWinrateByUsername).toHaveBeenCalledWith("alice", {
      mode: "global",
      globalRank: 55,
    });
  });

  it("overrides profile stats with rated winrate fields when available", async () => {
    const profile = createViewerProfileFixture({
      username: "alice",
      stats: {
        eloRating: 1700,
        globalRank: 44,
        winRate: 0.4,
        wins: 10,
        losses: 15,
        draws: 1,
      },
    });

    mockedGetViewerProfile.mockResolvedValue(profile);
    mockedGetRatedWinrateByUsername.mockResolvedValue({
      winRate: 0.72,
      wins: 36,
      losses: 9,
      draws: 5,
    } as Awaited<ReturnType<typeof getRatedWinrateByUsername>>);

    await expect(getViewerProfilePageData("alice")).resolves.toEqual({
      ...profile,
      stats: {
        ...profile.stats,
        winRate: 0.72,
        wins: 36,
        losses: 9,
        draws: 5,
      },
    });
  });
});
