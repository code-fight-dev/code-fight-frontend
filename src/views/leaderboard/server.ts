import "server-only";

import { getLeaderboardPage } from "@/entities/leaderboard/server";

const LEADERBOARD_LIMIT = 100;

export async function getLeaderboardViewData() {
  return getLeaderboardPage({
    mode: "global",
    limit: LEADERBOARD_LIMIT,
    offset: 0,
  });
}
