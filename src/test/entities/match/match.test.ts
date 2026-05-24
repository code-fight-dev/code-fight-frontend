import { describe, expect, it } from "vitest";

import {
  parseCurrentMatchResponse,
  parseMatchFromSnakeCase,
  parseQueueResultFromSnakeCase,
  readMatchUpdatedAtTimestamp,
} from "@/entities/match";

const baseSnakeMatch = () => ({
  id: "match-1",
  rating_mode: "global",
  task_mode: "NORMAL",
  task_id: "task-1",
  task_difficulty_snapshot: "MEDIUM",
  player1_id: "player-1",
  player2_id: "player-2",
  player1_ready: true,
  player2_ready: false,
  winner_id: "player-1",
  status: "running",
  judge_status: "ready",
  result_type: "player1_win",
  winning_reason: "accepted_faster",
  is_rated: true,
  rating_applied: false,
  player1_rating_delta: 12,
  player2_rating_delta: -8,
  player1_score: 120,
  player2_score: 90,
  player1_attempts: 2,
  player2_attempts: 3,
  player1_solved: true,
  player2_solved: false,
  player1_solved_at: "2026-05-24T10:05:00.000Z",
  player2_solved_at: "2026-05-24T10:08:00.000Z",
  started_at: "2026-05-24T10:00:00.000Z",
  finished_at: "2026-05-24T10:10:00.000Z",
  expires_at: "2026-05-24T10:30:00.000Z",
  created_at: "2026-05-24T09:59:00.000Z",
  updated_at: "2026-05-24T10:11:00.000Z",
});

const baseParsedMatch = () => ({
  id: "match-1",
  ratingMode: "global",
  taskMode: "normal",
  taskId: "task-1",
  taskDifficultySnapshot: "medium",
  player1Id: "player-1",
  player2Id: "player-2",
  player1Ready: true,
  player2Ready: false,
  winnerId: "player-1",
  status: "running",
  judgeStatus: "ready",
  resultType: "player1_win",
  winningReason: "accepted_faster",
  isRated: true,
  ratingApplied: false,
  player1RatingDelta: 12,
  player2RatingDelta: -8,
  player1Score: 120,
  player2Score: 90,
  player1Attempts: 2,
  player2Attempts: 3,
  player1Solved: true,
  player2Solved: false,
  player1SolvedAt: "2026-05-24T10:05:00.000Z",
  player2SolvedAt: "2026-05-24T10:08:00.000Z",
  startedAt: "2026-05-24T10:00:00.000Z",
  finishedAt: "2026-05-24T10:10:00.000Z",
  expiresAt: "2026-05-24T10:30:00.000Z",
  createdAt: "2026-05-24T09:59:00.000Z",
  updatedAt: "2026-05-24T10:11:00.000Z",
});

function parseValidMatch(overrides: Record<string, unknown> = {}) {
  const match = parseMatchFromSnakeCase({
    ...baseSnakeMatch(),
    ...overrides,
  });

  if (!match) {
    throw new Error("Expected valid match fixture to be parsed");
  }

  return match;
}

describe("parseMatchFromSnakeCase", () => {
  it("returns null when value is not an object", () => {
    expect(parseMatchFromSnakeCase(null)).toBeNull();
    expect(parseMatchFromSnakeCase(undefined)).toBeNull();
    expect(parseMatchFromSnakeCase("match")).toBeNull();
    expect(parseMatchFromSnakeCase(123)).toBeNull();
    expect(parseMatchFromSnakeCase([])).toBeNull();
  });

  it("parses a complete snake_case match into camelCase match", () => {
    const match = parseMatchFromSnakeCase(baseSnakeMatch());

    expect(match).toStrictEqual(baseParsedMatch());
  });

  it("uses global as default rating mode when rating_mode is missing or empty", () => {
    expect(parseValidMatch({ rating_mode: undefined }).ratingMode).toBe("global");
    expect(parseValidMatch({ rating_mode: "" }).ratingMode).toBe("global");
    expect(parseValidMatch({ rating_mode: "duel" }).ratingMode).toBe("duel");
  });

  it("normalizes task mode and optional task difficulty", () => {
    const match = parseValidMatch({
      task_mode: "HARD",
      task_difficulty_snapshot: "Easy",
    });

    expect(match.taskMode).toBe("hard");
    expect(match.taskDifficultySnapshot).toBe("easy");
  });

  it("omits empty optional fields", () => {
    const match = parseValidMatch({
      task_id: "",
      task_difficulty_snapshot: "",
      winner_id: "",
      result_type: "",
      winning_reason: "",
      player1_rating_delta: undefined,
      player2_rating_delta: undefined,
      player1_solved_at: "",
      player2_solved_at: "",
      started_at: "",
      finished_at: "",
      expires_at: "",
    });

    expect(match).not.toHaveProperty("taskId");
    expect(match).not.toHaveProperty("taskDifficultySnapshot");
    expect(match).not.toHaveProperty("winnerId");
    expect(match).not.toHaveProperty("resultType");
    expect(match).not.toHaveProperty("winningReason");
    expect(match).not.toHaveProperty("player1RatingDelta");
    expect(match).not.toHaveProperty("player2RatingDelta");
    expect(match).not.toHaveProperty("player1SolvedAt");
    expect(match).not.toHaveProperty("player2SolvedAt");
    expect(match).not.toHaveProperty("startedAt");
    expect(match).not.toHaveProperty("finishedAt");
    expect(match).not.toHaveProperty("expiresAt");
  });

  it.each([
    ["id", ""],
    ["task_mode", "unsupported"],
    ["player1_id", ""],
    ["player2_id", ""],
    ["created_at", ""],
    ["updated_at", ""],
    ["status", "paused"],
    ["judge_status", "unknown"],
    ["player1_ready", "not-boolean"],
    ["player2_ready", "not-boolean"],
    ["is_rated", "not-boolean"],
    ["rating_applied", "not-boolean"],
    ["player1_score", null],
    ["player2_score", null],
    ["player1_attempts", null],
    ["player2_attempts", null],
    ["player1_solved", "not-boolean"],
    ["player2_solved", "not-boolean"],
  ])("returns null when required field %s is invalid", (field, value) => {
    const result = parseMatchFromSnakeCase({
      ...baseSnakeMatch(),
      [field]: value,
    });

    expect(result).toBeNull();
  });

  it.each([
    ["task_difficulty_snapshot", "impossible"],
    ["result_type", "unknown_result"],
    ["winning_reason", "unknown_reason"],
  ])("returns null when optional enum field %s has invalid value", (field, value) => {
    const result = parseMatchFromSnakeCase({
      ...baseSnakeMatch(),
      [field]: value,
    });

    expect(result).toBeNull();
  });

  it.each(["pending", "running", "finished", "cancelled"])(
    "accepts match status %s",
    (status) => {
      expect(parseValidMatch({ status }).status).toBe(status);
    },
  );

  it.each(["not_started", "ready", "running", "finished", "failed"])(
    "accepts judge status %s",
    (judgeStatus) => {
      expect(parseValidMatch({ judge_status: judgeStatus }).judgeStatus).toBe(
        judgeStatus,
      );
    },
  );

  it.each(["player1_win", "player2_win", "draw", "cancelled"])(
    "accepts result type %s",
    (resultType) => {
      expect(parseValidMatch({ result_type: resultType }).resultType).toBe(resultType);
    },
  );

  it.each([
    "accepted_faster",
    "accepted_more_tests",
    "opponent_failed",
    "surrender",
    "draw",
    "cancelled",
  ])("accepts winning reason %s", (winningReason) => {
    expect(parseValidMatch({ winning_reason: winningReason }).winningReason).toBe(
      winningReason,
    );
  });
});

describe("parseQueueResultFromSnakeCase", () => {
  it("returns null when value is not an object", () => {
    expect(parseQueueResultFromSnakeCase(null)).toBeNull();
    expect(parseQueueResultFromSnakeCase("queue")).toBeNull();
    expect(parseQueueResultFromSnakeCase([])).toBeNull();
  });

  it("returns null when queue status is invalid", () => {
    expect(parseQueueResultFromSnakeCase({ status: "" })).toBeNull();
    expect(parseQueueResultFromSnakeCase({ status: "cancelled" })).toBeNull();
  });

  it("parses queued status without match", () => {
    expect(
      parseQueueResultFromSnakeCase({
        status: "queued",
      }),
    ).toStrictEqual({
      status: "queued",
    });
  });

  it("parses matched status with valid match", () => {
    const rawMatch = baseSnakeMatch();

    expect(
      parseQueueResultFromSnakeCase({
        status: "matched",
        match: rawMatch,
      }),
    ).toStrictEqual({
      status: "matched",
      match: baseParsedMatch(),
    });
  });

  it("omits match when nested match is invalid", () => {
    expect(
      parseQueueResultFromSnakeCase({
        status: "matched",
        match: {
          id: "",
        },
      }),
    ).toStrictEqual({
      status: "matched",
    });
  });
});

describe("parseCurrentMatchResponse", () => {
  it("returns null when value is not an object", () => {
    expect(parseCurrentMatchResponse(null)).toBeNull();
    expect(parseCurrentMatchResponse("response")).toBeNull();
    expect(parseCurrentMatchResponse([])).toBeNull();
  });

  it("returns match null when response has null match", () => {
    expect(
      parseCurrentMatchResponse({
        match: null,
      }),
    ).toStrictEqual({
      match: null,
    });
  });

  it("returns null when nested match is invalid", () => {
    expect(
      parseCurrentMatchResponse({
        match: {
          id: "",
        },
      }),
    ).toBeNull();
  });

  it("parses response with valid match", () => {
    const rawMatch = baseSnakeMatch();

    expect(
      parseCurrentMatchResponse({
        match: rawMatch,
      }),
    ).toStrictEqual({
      match: baseParsedMatch(),
    });
  });
});

describe("readMatchUpdatedAtTimestamp", () => {
  it("uses updatedAt timestamp when updatedAt is valid date", () => {
    const updatedAt = "2026-05-24T10:11:00.000Z";
    const match = parseValidMatch({ updated_at: updatedAt });

    expect(readMatchUpdatedAtTimestamp(match)).toBe(Date.parse(updatedAt));
  });

  it("falls back to createdAt timestamp when updatedAt is invalid", () => {
    const createdAt = "2026-05-24T09:59:00.000Z";
    const match = parseValidMatch({
      updated_at: "not-a-date",
      created_at: createdAt,
    });

    expect(readMatchUpdatedAtTimestamp(match)).toBe(Date.parse(createdAt));
  });

  it("returns 0 when updatedAt and createdAt are not parseable", () => {
    const match = parseValidMatch({
      updated_at: "not-a-date",
      created_at: "also-not-a-date",
    });

    expect(readMatchUpdatedAtTimestamp(match)).toBe(0);
  });
});
