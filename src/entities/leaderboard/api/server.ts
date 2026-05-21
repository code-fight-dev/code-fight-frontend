import "server-only";

import { headers } from "next/headers";
import { API_BASE_URL } from "@/shared/config/api";
import { isLeaderboardPage } from "../model/types";
import type { LeaderboardPage } from "../model/types";

type GetLeaderboardPageOptions = {
  mode?: string;
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
};

export type RatedWinrateStats = {
  winRate: number;
  wins: number;
  losses: number;
  draws: number;
  ratedGames: number;
};

type GetRatedWinrateOptions = {
  mode?: string;
  globalRank?: number | null;
};

function toQueryString({
  mode,
  limit,
  offset,
  page,
  pageSize,
}: GetLeaderboardPageOptions) {
  const query = new URLSearchParams();

  if (mode && mode.trim() !== "") {
    query.set("mode", mode.trim());
  }
  if (typeof limit === "number") {
    query.set("limit", String(limit));
  } else if (typeof pageSize === "number") {
    query.set("pageSize", String(pageSize));
  }
  if (typeof offset === "number") {
    query.set("offset", String(offset));
  }
  if (typeof page === "number") {
    query.set("page", String(page));
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getLeaderboardPage(
  options: GetLeaderboardPageOptions = {},
): Promise<LeaderboardPage> {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");
  const response = await fetch(
    `${API_BASE_URL}/api/leaderboard${toQueryString(options)}`,
    {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  const body = (await response.json().catch(() => null)) as unknown;
  if (!isLeaderboardPage(body)) {
    throw new Error("Invalid leaderboard response");
  }

  return body;
}

function toRatedWinrateStats(entry: LeaderboardPage["items"][number]): RatedWinrateStats {
  return {
    winRate: entry.winRate,
    wins: entry.wins,
    losses: entry.losses,
    draws: entry.draws,
    ratedGames: entry.ratedGames,
  };
}

export async function getRatedWinrateByUsername(
  username: string,
  options: GetRatedWinrateOptions = {},
): Promise<RatedWinrateStats | null> {
  const mode = options.mode ?? "global";
  const globalRank = options.globalRank ?? null;
  const normalizedUsername = username.trim().toLowerCase();
  if (normalizedUsername === "") {
    return null;
  }

  const limit = 100;

  if (globalRank !== null && Number.isInteger(globalRank) && globalRank > 0) {
    const offset = Math.floor((globalRank - 1) / limit) * limit;
    const rankPage = await getLeaderboardPage({ mode, limit, offset });
    const rankPageHit = rankPage.items.find(
      (entry) => entry.username.toLowerCase() === normalizedUsername,
    );
    if (rankPageHit) {
      return toRatedWinrateStats(rankPageHit);
    }
  }

  const firstPage = await getLeaderboardPage({ mode, limit, offset: 0 });

  if (
    firstPage.viewerRank &&
    firstPage.viewerRank.username.toLowerCase() === normalizedUsername
  ) {
    return toRatedWinrateStats(firstPage.viewerRank);
  }

  const firstPageHit = firstPage.items.find(
    (entry) => entry.username.toLowerCase() === normalizedUsername,
  );
  if (firstPageHit) {
    return toRatedWinrateStats(firstPageHit);
  }

  for (let offset = limit; offset < firstPage.total; offset += limit) {
    const page = await getLeaderboardPage({ mode, limit, offset });
    const hit = page.items.find(
      (entry) => entry.username.toLowerCase() === normalizedUsername,
    );
    if (hit) {
      return toRatedWinrateStats(hit);
    }
  }

  return null;
}
