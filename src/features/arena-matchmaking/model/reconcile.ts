import type { Match } from "@/entities/match";
import type { ArenaMatchmakingState } from "./types";

export function getMatchVersion(match: Match) {
  const updatedAt = Date.parse(match.updatedAt);
  if (Number.isFinite(updatedAt)) {
    return updatedAt;
  }

  const createdAt = Date.parse(match.createdAt);
  if (Number.isFinite(createdAt)) {
    return createdAt;
  }

  return 0;
}

export function getReadyState(match: Match | null, viewerId: string | null) {
  if (!viewerId || !match) {
    return {
      selfAccepted: false,
      opponentAccepted: false,
    };
  }

  if (match.player1Id === viewerId) {
    return {
      selfAccepted: match.player1Ready,
      opponentAccepted: match.player2Ready,
    };
  }

  if (match.player2Id === viewerId) {
    return {
      selfAccepted: match.player2Ready,
      opponentAccepted: match.player1Ready,
    };
  }

  return {
    selfAccepted: false,
    opponentAccepted: false,
  };
}

export function toPendingState(
  match: Match,
  viewerId: string | null,
): ArenaMatchmakingState {
  const { selfAccepted, opponentAccepted } = getReadyState(match, viewerId);

  if (!selfAccepted) {
    return "pending_accept";
  }

  if (!opponentAccepted) {
    return "waiting_opponent";
  }

  return "accepting";
}
