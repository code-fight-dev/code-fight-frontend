import type { Match } from "@/entities/match";

export function createMatchFixture(overrides: Partial<Match> = {}): Match {
  return {
    id: "match-1",
    ratingMode: "global",
    taskMode: "normal",
    player1Id: "viewer-1",
    player2Id: "viewer-2",
    player1Ready: false,
    player2Ready: false,
    status: "pending",
    judgeStatus: "ready",
    isRated: true,
    ratingApplied: false,
    player1Score: 0,
    player2Score: 0,
    player1Attempts: 0,
    player2Attempts: 0,
    player1Solved: false,
    player2Solved: false,
    createdAt: "2026-05-24T10:00:00.000Z",
    updatedAt: "2026-05-24T10:00:01.000Z",
    ...overrides,
  };
}
