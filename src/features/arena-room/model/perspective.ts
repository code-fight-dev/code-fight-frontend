import type { Match } from "@/entities/match";

export function getMatchPerspective(match: Match | null, viewerId: string | null) {
  if (!match || !viewerId) {
    return {
      selfScore: 0,
      opponentScore: 0,
      selfAttempts: 0,
      opponentAttempts: 0,
      selfSolved: false,
      opponentSolved: false,
    };
  }

  if (viewerId === match.player1Id) {
    return {
      selfScore: match.player1Score,
      opponentScore: match.player2Score,
      selfAttempts: match.player1Attempts,
      opponentAttempts: match.player2Attempts,
      selfSolved: match.player1Solved,
      opponentSolved: match.player2Solved,
    };
  }

  if (viewerId === match.player2Id) {
    return {
      selfScore: match.player2Score,
      opponentScore: match.player1Score,
      selfAttempts: match.player2Attempts,
      opponentAttempts: match.player1Attempts,
      selfSolved: match.player2Solved,
      opponentSolved: match.player1Solved,
    };
  }

  return {
    selfScore: 0,
    opponentScore: 0,
    selfAttempts: 0,
    opponentAttempts: 0,
    selfSolved: false,
    opponentSolved: false,
  };
}
