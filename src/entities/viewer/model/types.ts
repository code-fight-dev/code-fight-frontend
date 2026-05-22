export type Viewer = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
};

export type AvatarSource = "none" | "provider" | "custom";

export type ViewerProfileStats = {
  eloRating: number;
  globalRank: number | null;
  globalPlayersCount: number | null;
  regionalRank: number | null;
  regionalPlayersCount: number | null;
  winRate: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  avgSolutionTimeSeconds: number | null;
  maxWinStreak: number;
};

export type ViewerProfileEloHistoryPoint = {
  date: string;
  delta: number;
  rating: number;
  matchesPlayed: number;
};

export type ViewerProfileTopLanguage = {
  name: string;
  usageShare: number;
};

export type ViewerProfileRecentMatchResult = "win" | "loss" | "draw" | "cancelled";

export type ViewerProfileRecentMatchDifficulty = "easy" | "medium" | "hard";

export type ViewerProfileRecentMatchOpponent = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type ViewerProfileRecentMatch = {
  id: string;
  result: ViewerProfileRecentMatchResult;
  opponent: ViewerProfileRecentMatchOpponent;
  difficulty: ViewerProfileRecentMatchDifficulty | null;
  eloDelta: number | null;
  isRated: boolean;
  finishedAt: string;
};

export type ViewerProfile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  country: string;
  countryCode: string;
  stateProvince: string;
  city: string;
  avatarUrl: string;
  providerAvatarUrl: string;
  avatarSource: AvatarSource;
  authProvider: string;
  createdAt: string;
  stats: ViewerProfileStats;
  eloHistory: ViewerProfileEloHistoryPoint[];
  topLanguages: ViewerProfileTopLanguage[];
  recentMatches: ViewerProfileRecentMatch[];
};

export type UpdateViewerProfileInput = {
  displayName: string;
  bio: string;
  country: string;
  countryCode: string;
  stateProvince: string;
  city: string;
  avatarDataUrl?: string;
  removeCustomAvatar?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isNumber(value);
}

function isAvatarSource(value: unknown): value is AvatarSource {
  return value === "none" || value === "provider" || value === "custom";
}

function isViewerProfileStats(value: unknown): value is ViewerProfileStats {
  return (
    isRecord(value) &&
    isNumber(value.eloRating) &&
    isNullableNumber(value.globalRank) &&
    isNullableNumber(value.globalPlayersCount) &&
    isNullableNumber(value.regionalRank) &&
    isNullableNumber(value.regionalPlayersCount) &&
    isNumber(value.winRate) &&
    isNumber(value.totalMatches) &&
    isNumber(value.wins) &&
    isNumber(value.losses) &&
    isNumber(value.draws) &&
    isNullableNumber(value.avgSolutionTimeSeconds) &&
    isNumber(value.maxWinStreak)
  );
}

function isViewerProfileEloHistoryPoint(
  value: unknown,
): value is ViewerProfileEloHistoryPoint {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    isNumber(value.delta) &&
    isNumber(value.rating) &&
    isNumber(value.matchesPlayed)
  );
}

function isViewerProfileTopLanguage(value: unknown): value is ViewerProfileTopLanguage {
  return isRecord(value) && typeof value.name === "string" && isNumber(value.usageShare);
}

function isViewerProfileRecentMatchResult(
  value: unknown,
): value is ViewerProfileRecentMatchResult {
  return value === "win" || value === "loss" || value === "draw" || value === "cancelled";
}

function isViewerProfileRecentMatchDifficulty(
  value: unknown,
): value is ViewerProfileRecentMatchDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function isViewerProfileRecentMatchOpponent(
  value: unknown,
): value is ViewerProfileRecentMatchOpponent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.username === "string" &&
    typeof value.displayName === "string" &&
    typeof value.avatarUrl === "string"
  );
}

function isViewerProfileRecentMatch(value: unknown): value is ViewerProfileRecentMatch {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isViewerProfileRecentMatchResult(value.result) &&
    isViewerProfileRecentMatchOpponent(value.opponent) &&
    (value.difficulty === null ||
      isViewerProfileRecentMatchDifficulty(value.difficulty)) &&
    isNullableNumber(value.eloDelta) &&
    typeof value.isRated === "boolean" &&
    typeof value.finishedAt === "string"
  );
}

export function isViewer(value: unknown): value is Viewer {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.username === "string" &&
    typeof value.createdAt === "string"
  );
}

export function isViewerProfile(value: unknown): value is ViewerProfile {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.username === "string" &&
    typeof value.displayName === "string" &&
    typeof value.bio === "string" &&
    typeof value.country === "string" &&
    typeof value.countryCode === "string" &&
    typeof value.stateProvince === "string" &&
    typeof value.city === "string" &&
    typeof value.avatarUrl === "string" &&
    typeof value.providerAvatarUrl === "string" &&
    isAvatarSource(value.avatarSource) &&
    typeof value.authProvider === "string" &&
    typeof value.createdAt === "string" &&
    isViewerProfileStats(value.stats) &&
    Array.isArray(value.eloHistory) &&
    value.eloHistory.every(isViewerProfileEloHistoryPoint) &&
    Array.isArray(value.topLanguages) &&
    value.topLanguages.every(isViewerProfileTopLanguage) &&
    Array.isArray(value.recentMatches) &&
    value.recentMatches.every(isViewerProfileRecentMatch)
  );
}
