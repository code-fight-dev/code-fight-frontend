import "server-only";

import { getLeaderboardPage } from "@/entities/leaderboard/server";
import type { LeaderboardEntry, LeaderboardPage } from "@/entities/leaderboard";

const DEFAULT_LEADERBOARD_PAGE = 1;
const DEFAULT_LEADERBOARD_PAGE_SIZE = 10;
const MAX_LEADERBOARD_PAGE_SIZE = 100;
const PODIUM_LIMIT = 3;

type GetLeaderboardViewDataOptions = {
  mode?: string;
  page?: number;
  pageSize?: number;
};

export type LeaderboardViewData = {
  page: LeaderboardPage;
  podiumItems: LeaderboardEntry[];
};

function normalizePage(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_LEADERBOARD_PAGE;
  }

  return Math.max(DEFAULT_LEADERBOARD_PAGE, Math.floor(value));
}

function normalizePageSize(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_LEADERBOARD_PAGE_SIZE;
  }

  const normalized = Math.floor(value);
  if (normalized <= 0) {
    return DEFAULT_LEADERBOARD_PAGE_SIZE;
  }

  return Math.min(normalized, MAX_LEADERBOARD_PAGE_SIZE);
}

function getPageNumber(page: LeaderboardPage) {
  return Math.floor(page.offset / page.limit) + 1;
}

function getTotalPages(page: LeaderboardPage) {
  return Math.max(1, Math.ceil(page.total / page.limit));
}

export async function getLeaderboardViewData(
  options: GetLeaderboardViewDataOptions = {},
): Promise<LeaderboardViewData> {
  const mode = options.mode ?? "global";
  const requestedPage = normalizePage(options.page);
  const pageSize = normalizePageSize(options.pageSize);

  let leaderboardPage = await getLeaderboardPage({
    mode,
    page: requestedPage,
    pageSize,
  });

  const totalPages = getTotalPages(leaderboardPage);
  if (requestedPage > totalPages) {
    leaderboardPage = await getLeaderboardPage({
      mode,
      page: totalPages,
      pageSize,
    });
  }

  let podiumItems = leaderboardPage.items.slice(0, PODIUM_LIMIT);
  if (getPageNumber(leaderboardPage) !== 1 || podiumItems.length < PODIUM_LIMIT) {
    const podiumPage = await getLeaderboardPage({
      mode,
      page: 1,
      pageSize: PODIUM_LIMIT,
    });
    podiumItems = podiumPage.items.slice(0, PODIUM_LIMIT);
  }

  return {
    page: leaderboardPage,
    podiumItems,
  };
}
