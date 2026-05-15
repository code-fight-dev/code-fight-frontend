import { getRankByRating } from "@/entities/rank";
import type { RankTier } from "@/entities/rank";
import type { LeaderboardEntry } from "./types";

const integerFormatter = new Intl.NumberFormat("en-US");

export function formatInteger(value: number) {
  return integerFormatter.format(value);
}

export function formatWinRate(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatWLD(entry: LeaderboardEntry) {
  return `${formatInteger(entry.wins)} / ${formatInteger(entry.losses)} / ${formatInteger(entry.draws)}`;
}

export function getEntryGames(entry: LeaderboardEntry) {
  const bySum = entry.wins + entry.losses + entry.draws;
  return entry.ratedGames > 0 ? entry.ratedGames : bySum;
}

export function getEntryTier(entry: LeaderboardEntry): RankTier {
  return getRankByRating(entry.rating).tier;
}

export function getEntryTierColor(entry: LeaderboardEntry) {
  return getRankByRating(entry.rating).color;
}

export function getSearchableLabel(entry: LeaderboardEntry) {
  return `${entry.displayName} ${entry.username}`.toLowerCase();
}
