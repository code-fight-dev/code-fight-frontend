import "server-only";

import { getRatedWinrateByUsername } from "@/entities/leaderboard/server";
import { getRankByRating, type RankTier } from "@/entities/rank";
import { getViewerProfile } from "@/entities/viewer";
import { getCurrentViewerServer } from "@/entities/viewer/server";

export type ArenaPageData = {
  viewer: {
    username: string | null;
    avatarUrl: string;
    eloRating: number | null;
    globalRank: number | null;
    tier: RankTier | null;
  };
  stats: {
    totalMatches: number;
    winRate: number;
    wins: number;
    maxWinStreak: number;
  } | null;
};

export async function getArenaPageData(): Promise<ArenaPageData> {
  const viewer = await getCurrentViewerServer();
  if (!viewer) {
    return {
      viewer: {
        username: null,
        avatarUrl: "",
        eloRating: null,
        globalRank: null,
        tier: null,
      },
      stats: null,
    };
  }

  const profile = await getViewerProfile(viewer.username);
  if (!profile) {
    return {
      viewer: {
        username: viewer.username,
        avatarUrl: "",
        eloRating: null,
        globalRank: null,
        tier: null,
      },
      stats: null,
    };
  }

  const ratedWinrate = await getRatedWinrateByUsername(viewer.username, {
    mode: "global",
    globalRank: profile.stats.globalRank,
  });
  const tier = getRankByRating(profile.stats.eloRating).tier;

  return {
    viewer: {
      username: viewer.username,
      avatarUrl: profile.avatarUrl,
      eloRating: profile.stats.eloRating,
      globalRank: profile.stats.globalRank,
      tier,
    },
    stats: {
      totalMatches: profile.stats.totalMatches,
      winRate: ratedWinrate?.winRate ?? profile.stats.winRate,
      wins: profile.stats.wins,
      maxWinStreak: profile.stats.maxWinStreak,
    },
  };
}
