import type {
  Match,
  MatchJudgeStatus,
  MatchResultType,
  MatchStatus,
  MatchTaskDifficulty,
  MatchTaskMode,
  MatchWinningReason,
  QueueResult,
  QueueStatus,
} from "../types";
import {
  isRecord,
  readOptionalBoolean,
  readOptionalNumber,
  readOptionalString,
  readRequiredNumber,
  readString,
} from "./scalars";

const MATCH_STATUS_SET = new Set<MatchStatus>([
  "pending",
  "running",
  "finished",
  "cancelled",
]);
const MATCH_TASK_MODE_SET = new Set<MatchTaskMode>(["normal", "hard"]);
const MATCH_DIFFICULTY_SET = new Set<MatchTaskDifficulty>(["easy", "medium", "hard"]);
const MATCH_JUDGE_STATUS_SET = new Set<MatchJudgeStatus>([
  "not_started",
  "ready",
  "running",
  "finished",
  "failed",
]);
const MATCH_RESULT_TYPE_SET = new Set<MatchResultType>([
  "player1_win",
  "player2_win",
  "draw",
  "cancelled",
]);
const MATCH_WINNING_REASON_SET = new Set<MatchWinningReason>([
  "accepted_faster",
  "accepted_more_tests",
  "opponent_failed",
  "surrender",
  "draw",
  "cancelled",
]);
const QUEUE_STATUS_SET = new Set<QueueStatus>(["queued", "matched"]);

function parseMatchStatus(value: unknown) {
  const normalized = readString(value).trim();
  return MATCH_STATUS_SET.has(normalized as MatchStatus)
    ? (normalized as MatchStatus)
    : null;
}

function parseTaskMode(value: unknown) {
  const normalized = readString(value).trim().toLowerCase();
  return MATCH_TASK_MODE_SET.has(normalized as MatchTaskMode)
    ? (normalized as MatchTaskMode)
    : null;
}

function parseOptionalTaskDifficulty(value: unknown) {
  const normalized = readString(value).trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (MATCH_DIFFICULTY_SET.has(normalized as MatchTaskDifficulty)) {
    return normalized as MatchTaskDifficulty;
  }

  return null;
}

function parseJudgeStatus(value: unknown) {
  const normalized = readString(value).trim();
  return MATCH_JUDGE_STATUS_SET.has(normalized as MatchJudgeStatus)
    ? (normalized as MatchJudgeStatus)
    : null;
}

function parseOptionalResultType(value: unknown) {
  const normalized = readString(value).trim();
  if (!normalized) {
    return undefined;
  }

  if (MATCH_RESULT_TYPE_SET.has(normalized as MatchResultType)) {
    return normalized as MatchResultType;
  }

  return null;
}

function parseOptionalWinningReason(value: unknown) {
  const normalized = readString(value).trim();
  if (!normalized) {
    return undefined;
  }

  if (MATCH_WINNING_REASON_SET.has(normalized as MatchWinningReason)) {
    return normalized as MatchWinningReason;
  }

  return null;
}

function parseQueueStatus(value: unknown) {
  const normalized = readString(value).trim();
  return QUEUE_STATUS_SET.has(normalized as QueueStatus)
    ? (normalized as QueueStatus)
    : null;
}

export function parseMatchFromSnakeCase(value: unknown): Match | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id).trim();
  const ratingMode = readString(value.rating_mode, "global").trim() || "global";
  const taskMode = parseTaskMode(value.task_mode);
  const player1Id = readString(value.player1_id).trim();
  const player2Id = readString(value.player2_id).trim();
  const createdAt = readString(value.created_at).trim();
  const updatedAt = readString(value.updated_at).trim();
  const status = parseMatchStatus(value.status);
  const judgeStatus = parseJudgeStatus(value.judge_status);
  const player1Ready = readOptionalBoolean(value.player1_ready);
  const player2Ready = readOptionalBoolean(value.player2_ready);
  const isRated = readOptionalBoolean(value.is_rated);
  const ratingApplied = readOptionalBoolean(value.rating_applied);
  const player1Score = readRequiredNumber(value.player1_score);
  const player2Score = readRequiredNumber(value.player2_score);
  const player1Attempts = readRequiredNumber(value.player1_attempts);
  const player2Attempts = readRequiredNumber(value.player2_attempts);
  const player1RatingDelta = readOptionalNumber(value.player1_rating_delta);
  const player2RatingDelta = readOptionalNumber(value.player2_rating_delta);
  const player1Solved = readOptionalBoolean(value.player1_solved);
  const player2Solved = readOptionalBoolean(value.player2_solved);

  if (
    !id ||
    !taskMode ||
    !player1Id ||
    !player2Id ||
    !createdAt ||
    !updatedAt ||
    !status ||
    !judgeStatus ||
    typeof player1Ready !== "boolean" ||
    typeof player2Ready !== "boolean" ||
    typeof isRated !== "boolean" ||
    typeof ratingApplied !== "boolean" ||
    player1Score === null ||
    player2Score === null ||
    player1Attempts === null ||
    player2Attempts === null ||
    typeof player1Solved !== "boolean" ||
    typeof player2Solved !== "boolean"
  ) {
    return null;
  }

  const taskDifficultySnapshot = parseOptionalTaskDifficulty(
    value.task_difficulty_snapshot,
  );
  if (taskDifficultySnapshot === null) {
    return null;
  }

  const resultType = parseOptionalResultType(value.result_type);
  if (resultType === null) {
    return null;
  }

  const winningReason = parseOptionalWinningReason(value.winning_reason);
  if (winningReason === null) {
    return null;
  }

  const taskId = readOptionalString(value.task_id);
  const winnerId = readOptionalString(value.winner_id);
  const player1SolvedAt = readOptionalString(value.player1_solved_at);
  const player2SolvedAt = readOptionalString(value.player2_solved_at);
  const startedAt = readOptionalString(value.started_at);
  const finishedAt = readOptionalString(value.finished_at);
  const expiresAt = readOptionalString(value.expires_at);

  return {
    id,
    ratingMode,
    taskMode,
    ...(taskId ? { taskId } : {}),
    ...(taskDifficultySnapshot ? { taskDifficultySnapshot } : {}),
    player1Id,
    player2Id,
    player1Ready,
    player2Ready,
    ...(winnerId ? { winnerId } : {}),
    status,
    judgeStatus,
    ...(resultType ? { resultType } : {}),
    ...(winningReason ? { winningReason } : {}),
    isRated,
    ratingApplied,
    ...(player1RatingDelta !== undefined ? { player1RatingDelta } : {}),
    ...(player2RatingDelta !== undefined ? { player2RatingDelta } : {}),
    player1Score,
    player2Score,
    player1Attempts,
    player2Attempts,
    player1Solved,
    player2Solved,
    ...(player1SolvedAt ? { player1SolvedAt } : {}),
    ...(player2SolvedAt ? { player2SolvedAt } : {}),
    ...(startedAt ? { startedAt } : {}),
    ...(finishedAt ? { finishedAt } : {}),
    ...(expiresAt ? { expiresAt } : {}),
    createdAt,
    updatedAt,
  };
}

export function parseQueueResultFromSnakeCase(value: unknown): QueueResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const status = parseQueueStatus(value.status);
  if (!status) {
    return null;
  }

  const match = parseMatchFromSnakeCase(value.match);
  return {
    status,
    ...(match ? { match } : {}),
  };
}

export function parseCurrentMatchResponse(
  value: unknown,
): { match: Match | null } | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.match === null) {
    return {
      match: null,
    };
  }

  const match = parseMatchFromSnakeCase(value.match);
  if (!match) {
    return null;
  }

  return {
    match,
  };
}

export function readMatchUpdatedAtTimestamp(match: Match) {
  const updatedAtTimestamp = Date.parse(match.updatedAt);
  if (Number.isFinite(updatedAtTimestamp)) {
    return updatedAtTimestamp;
  }

  const createdAtTimestamp = Date.parse(match.createdAt);
  if (Number.isFinite(createdAtTimestamp)) {
    return createdAtTimestamp;
  }

  return readOptionalNumber(match.createdAt) ?? 0;
}
