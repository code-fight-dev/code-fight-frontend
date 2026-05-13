import type {
  ChallengeExecutionStatus,
  ChallengeJudgeStatus,
  ChallengeVerdict,
} from "../types";
import { readString } from "./scalars";

const EXECUTION_STATUS_VALUES = [
  "queued",
  "sent_to_judge",
  "running",
  "finished",
  "failed",
] as const satisfies readonly ChallengeExecutionStatus[];
const EXECUTION_STATUS_SET = new Set<string>(EXECUTION_STATUS_VALUES);

const JUDGE_STATUS_VALUES = [
  "pending",
  "queued",
  "running",
  "finished",
  "failed",
] as const satisfies readonly ChallengeJudgeStatus[];
const JUDGE_STATUS_SET = new Set<string>(JUDGE_STATUS_VALUES);

const VERDICT_VALUES = [
  "accepted",
  "wrong_answer",
  "time_limit_exceeded",
  "memory_limit_exceeded",
  "runtime_error",
  "compile_error",
  "presentation_error",
  "system_error",
] as const satisfies readonly ChallengeVerdict[];
const VERDICT_SET = new Set<string>(VERDICT_VALUES);

function isExecutionStatus(value: string): value is ChallengeExecutionStatus {
  return EXECUTION_STATUS_SET.has(value);
}

function isJudgeStatus(value: string): value is ChallengeJudgeStatus {
  return JUDGE_STATUS_SET.has(value);
}

function isVerdict(value: string): value is ChallengeVerdict {
  return VERDICT_SET.has(value);
}

export function parseExecutionStatus(value: unknown): ChallengeExecutionStatus | null {
  const normalized = readString(value).trim();
  if (!normalized) {
    return null;
  }

  return isExecutionStatus(normalized) ? normalized : null;
}

export function parseJudgeStatus(value: unknown): ChallengeJudgeStatus | null {
  const normalized = readString(value).trim();
  if (!normalized) {
    return null;
  }

  return isJudgeStatus(normalized) ? normalized : null;
}

export function parseVerdict(value: unknown): ChallengeVerdict | null {
  const normalized = readString(value).trim();
  if (!normalized) {
    return null;
  }

  return isVerdict(normalized) ? normalized : null;
}
