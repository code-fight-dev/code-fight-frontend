export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  country: string;
  countryCode: string;
  rating: number;
  ratedGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
};

export type LeaderboardPage = {
  mode: string;
  limit: number;
  offset: number;
  total: number;
  items: LeaderboardEntry[];
  viewerRank?: LeaderboardEntry;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  return (
    isRecord(value) &&
    isNumber(value.rank) &&
    typeof value.userId === "string" &&
    typeof value.username === "string" &&
    typeof value.displayName === "string" &&
    typeof value.avatarUrl === "string" &&
    typeof value.country === "string" &&
    typeof value.countryCode === "string" &&
    isNumber(value.rating) &&
    isNumber(value.ratedGames) &&
    isNumber(value.wins) &&
    isNumber(value.losses) &&
    isNumber(value.draws) &&
    isNumber(value.winRate)
  );
}

export function isLeaderboardPage(value: unknown): value is LeaderboardPage {
  return (
    isRecord(value) &&
    typeof value.mode === "string" &&
    isNumber(value.limit) &&
    isNumber(value.offset) &&
    isNumber(value.total) &&
    Array.isArray(value.items) &&
    value.items.every(isLeaderboardEntry) &&
    (value.viewerRank === undefined || isLeaderboardEntry(value.viewerRank))
  );
}
