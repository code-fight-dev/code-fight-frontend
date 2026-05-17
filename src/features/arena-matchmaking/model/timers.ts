import type { Match } from "@/entities/match";
import type { ArenaMatchmakingState } from "./types";

export const ACCEPT_WINDOW_SECONDS = 30;

export function shouldTickNow(state: ArenaMatchmakingState) {
  return (
    state === "searching" || state === "pending_accept" || state === "waiting_opponent"
  );
}

export function getSearchElapsedSeconds(now: number, searchStartedAt: number | null) {
  if (!searchStartedAt) {
    return 0;
  }

  return Math.max(0, Math.floor((now - searchStartedAt) / 1000));
}

export function getAcceptRemainingSeconds(now: number, currentMatch: Match | null) {
  if (!currentMatch || currentMatch.status !== "pending") {
    return ACCEPT_WINDOW_SECONDS;
  }

  const createdAt = Date.parse(currentMatch.createdAt);
  if (!Number.isFinite(createdAt)) {
    return ACCEPT_WINDOW_SECONDS;
  }

  const elapsedSeconds = Math.floor((now - createdAt) / 1000);
  return Math.max(0, ACCEPT_WINDOW_SECONDS - elapsedSeconds);
}
