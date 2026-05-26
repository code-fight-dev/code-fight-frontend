import { beforeEach, describe, expect, it, vi } from "vitest";

const homePageDataMocks = vi.hoisted(() => ({
  getPublicMatchStats: vi.fn(),
}));

vi.mock("@/entities/match/server", () => ({
  getPublicMatchStats: homePageDataMocks.getPublicMatchStats,
}));

import { getHomePageData } from "@/views/home/model/getHomePageData";

describe("views/home/model/getHomePageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns static snapshots when public stats are unavailable", async () => {
    homePageDataMocks.getPublicMatchStats.mockRejectedValue(
      new Error("service unavailable"),
    );

    const data = await getHomePageData();

    expect(data.heroSnapshot).toEqual({
      liveLabel: "Live Season",
      queueCount: 12438,
      featuredDevelopers: [
        { id: "ava", initials: "AV", tintClassName: "from-[#f2d6c5] to-[#8f6a5f]" },
        { id: "mk", initials: "MK", tintClassName: "from-[#dadfeb] to-[#6f7fa1]" },
        { id: "ln", initials: "LN", tintClassName: "from-[#f0e0d2] to-[#9f8074]" },
      ],
    });

    expect(data.platformStats).toEqual([
      {
        id: "active-players",
        label: "Active Players",
        value: "120K+",
        badge: "+12%",
        badgeTone: "success",
      },
      {
        id: "matches-hosted",
        label: "Matches Hosted",
        value: "2.5M",
        badge: "+25%",
        badgeTone: "success",
      },
      {
        id: "avg-queue-time",
        label: "Avg. Queue Time",
        value: "< 30s",
        badge: "Optimal",
        badgeTone: "info",
      },
    ]);

    expect(data.arenaEdgeSnapshot.title).toBe("Engineered for Competition");
    expect(data.leaderboardCtaSnapshot.actionHref).toBe("/arena");
  });

  it("uses live stats and sanitizes finite values for hero and platform cards", async () => {
    homePageDataMocks.getPublicMatchStats.mockResolvedValue({
      queuedPlayers: 3210.6,
      activeMatchPlayers: -7,
      cachedAt: "2026-05-25T20:00:00.000Z",
    });

    const data = await getHomePageData();

    expect(data.heroSnapshot.queueCount).toBe(3211);
    expect(data.platformStats).toEqual([
      {
        id: "active-match-players",
        label: "Active Match Players",
        value: "0",
        badge: "Live",
        badgeTone: "info",
      },
      {
        id: "queued-players",
        label: "Players In Queue",
        value: "3.2K",
        badge: "Live",
        badgeTone: "info",
      },
      {
        id: "avg-queue-time",
        label: "Avg. Queue Time",
        value: "< 30s",
        badge: "Optimal",
        badgeTone: "info",
      },
    ]);
  });

  it("coerces non-finite live stats to zero", async () => {
    homePageDataMocks.getPublicMatchStats.mockResolvedValue({
      queuedPlayers: Number.NaN,
      activeMatchPlayers: Number.POSITIVE_INFINITY,
      cachedAt: "2026-05-25T20:00:00.000Z",
    });

    const data = await getHomePageData();

    expect(data.heroSnapshot.queueCount).toBe(0);
    expect(data.platformStats[0]?.value).toBe("0");
    expect(data.platformStats[1]?.value).toBe("0");
  });
});
