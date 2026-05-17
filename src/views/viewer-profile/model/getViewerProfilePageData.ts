import "server-only";

import { getRatedWinrateByUsername } from "@/entities/leaderboard/server";
import { getViewerProfile } from "@/entities/viewer";

export async function getViewerProfilePageData(username: string) {
  const profile = await getViewerProfile(username);
  if (!profile) {
    return profile;
  }

  const ratedWinrate = await getRatedWinrateByUsername(profile.username, {
    mode: "global",
    globalRank: profile.stats.globalRank,
  });
  if (!ratedWinrate) {
    return profile;
  }

  return {
    ...profile,
    stats: {
      ...profile.stats,
      winRate: ratedWinrate.winRate,
      wins: ratedWinrate.wins,
      losses: ratedWinrate.losses,
      draws: ratedWinrate.draws,
    },
  };
}
