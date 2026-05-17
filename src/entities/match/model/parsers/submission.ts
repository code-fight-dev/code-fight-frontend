import type {
  MatchSubmission,
  MatchSubmissionExecutionStatus,
  MatchSubmissionJudgeStatus,
  MatchSubmissionTestResult,
  MatchSubmissionVerdict,
} from "../types";
import {
  isRecord,
  readOptionalNumber,
  readOptionalString,
  readRequiredNumber,
  readString,
} from "./scalars";

const EXECUTION_STATUS_SET = new Set<MatchSubmissionExecutionStatus>([
  "queued",
  "sent_to_judge",
  "running",
  "finished",
  "failed",
]);
const JUDGE_STATUS_SET = new Set<MatchSubmissionJudgeStatus>([
  "pending",
  "queued",
  "running",
  "finished",
  "failed",
]);
const VERDICT_SET = new Set<MatchSubmissionVerdict>([
  "accepted",
  "wrong_answer",
  "time_limit_exceeded",
  "memory_limit_exceeded",
  "runtime_error",
  "compile_error",
  "presentation_error",
  "system_error",
]);

function parseExecutionStatus(value: unknown): MatchSubmissionExecutionStatus | null {
  const normalized = readString(value).trim();
  return EXECUTION_STATUS_SET.has(normalized as MatchSubmissionExecutionStatus)
    ? (normalized as MatchSubmissionExecutionStatus)
    : null;
}

function parseOptionalJudgeStatus(
  value: unknown,
): MatchSubmissionJudgeStatus | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = readString(value).trim();
  if (!normalized) {
    return undefined;
  }

  if (JUDGE_STATUS_SET.has(normalized as MatchSubmissionJudgeStatus)) {
    return normalized as MatchSubmissionJudgeStatus;
  }

  return null;
}

function parseOptionalVerdict(value: unknown): MatchSubmissionVerdict | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = readString(value).trim();
  if (!normalized) {
    return undefined;
  }

  if (VERDICT_SET.has(normalized as MatchSubmissionVerdict)) {
    return normalized as MatchSubmissionVerdict;
  }

  return null;
}

function parseMatchSubmissionTestResult(
  value: unknown,
): MatchSubmissionTestResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const testCaseId = readString(value.test_case_id).trim();
  const status = readString(value.status).trim();
  if (!testCaseId || !status) {
    return null;
  }

  const timeMs = readOptionalNumber(value.time_ms);
  const memoryKb = readOptionalNumber(value.memory_kb);
  const exitCode = readOptionalNumber(value.exit_code);
  const checkerMessage = readOptionalString(value.checker_message);

  return {
    testCaseId,
    status,
    ...(timeMs !== undefined ? { timeMs } : {}),
    ...(memoryKb !== undefined ? { memoryKb } : {}),
    ...(exitCode !== undefined ? { exitCode } : {}),
    ...(checkerMessage ? { checkerMessage } : {}),
  };
}

export function parseMatchSubmissionFromSnakeCase(
  value: unknown,
): MatchSubmission | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id).trim();
  const taskId = readString(value.task_id).trim();
  const userId = readString(value.user_id).trim();
  const language = readString(value.language).trim();
  const languageVersion = readString(value.language_version).trim();
  const sourceCode = readString(value.source_code);
  const createdAt = readString(value.created_at).trim();
  const updatedAt = readString(value.updated_at).trim();
  const status = parseExecutionStatus(value.status);
  const passedTests = readRequiredNumber(value.passed_tests);
  const totalTests = readRequiredNumber(value.total_tests);
  const score = readRequiredNumber(value.score);
  const verdict = parseOptionalVerdict(value.verdict);
  const judgeStatus = parseOptionalJudgeStatus(value.judge_status);

  if (
    !id ||
    !taskId ||
    !userId ||
    !language ||
    !languageVersion ||
    !createdAt ||
    !updatedAt ||
    !status ||
    passedTests === null ||
    totalTests === null ||
    score === null ||
    verdict === null ||
    judgeStatus === null
  ) {
    return null;
  }

  const rawTestResults = value.test_results;
  const testResults = Array.isArray(rawTestResults)
    ? rawTestResults
        .map(parseMatchSubmissionTestResult)
        .filter(
          (
            testResult: MatchSubmissionTestResult | null,
          ): testResult is MatchSubmissionTestResult => testResult !== null,
        )
    : [];

  const compileTimeMs = readOptionalNumber(value.compile_time_ms);
  const runTimeMs = readOptionalNumber(value.run_time_ms);
  const peakMemoryKb = readOptionalNumber(value.peak_memory_kb);
  const exitCode = readOptionalNumber(value.exit_code);
  const matchId = readOptionalString(value.match_id);
  const judgeSubmissionId = readOptionalString(value.judge_submission_id);
  const errorMessage = readOptionalString(value.error_message);
  const compileLog = readOptionalString(value.compile_log);
  const stdoutTruncated = readOptionalString(value.stdout_truncated);
  const stderrTruncated = readOptionalString(value.stderr_truncated);
  const startedAt = readOptionalString(value.started_at);
  const finishedAt = readOptionalString(value.finished_at);

  return {
    id,
    ...(matchId ? { matchId } : {}),
    taskId,
    userId,
    language,
    languageVersion,
    sourceCode,
    status,
    ...(verdict ? { verdict } : {}),
    ...(judgeSubmissionId ? { judgeSubmissionId } : {}),
    ...(judgeStatus ? { judgeStatus } : {}),
    ...(errorMessage ? { errorMessage } : {}),
    passedTests,
    totalTests,
    ...(compileTimeMs !== undefined ? { compileTimeMs } : {}),
    ...(runTimeMs !== undefined ? { runTimeMs } : {}),
    ...(peakMemoryKb !== undefined ? { peakMemoryKb } : {}),
    score,
    ...(exitCode !== undefined ? { exitCode } : {}),
    ...(compileLog ? { compileLog } : {}),
    ...(stdoutTruncated ? { stdoutTruncated } : {}),
    ...(stderrTruncated ? { stderrTruncated } : {}),
    createdAt,
    ...(startedAt ? { startedAt } : {}),
    ...(finishedAt ? { finishedAt } : {}),
    updatedAt,
    testResults,
  };
}
