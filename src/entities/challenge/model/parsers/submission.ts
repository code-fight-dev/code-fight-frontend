import type {
  TaskSubmission,
  TaskSubmissionSummary,
  TaskSubmissionTestResult,
} from "../types";
import { parseExecutionStatus } from "./enums";
import {
  isRecord,
  readOptionalNumber,
  readOptionalString,
  readRequiredNumber,
  readString,
} from "./scalars";
import { parseOptionalJudgeStatus, parseOptionalVerdict } from "./optionalEnums";

type TaskSubmissionFieldMap = {
  id: string;
  matchId: string;
  taskId: string;
  userId: string;
  language: string;
  languageVersion: string;
  sourceCode: string;
  status: string;
  verdict: string;
  judgeSubmissionId: string;
  judgeStatus: string;
  errorMessage: string;
  passedTests: string;
  totalTests: string;
  compileTimeMs: string;
  runTimeMs: string;
  peakMemoryKb: string;
  score: string;
  exitCode: string;
  compileLog: string;
  stdoutTruncated: string;
  stderrTruncated: string;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
  updatedAt: string;
  testResults: string;
};

type TaskSubmissionTestFieldMap = {
  testCaseId: string;
  status: string;
  timeMs: string;
  memoryKb: string;
  exitCode: string;
  checkerMessage: string;
};

type TaskSubmissionSummaryFieldMap = {
  id: string;
  createdAt: string;
  language: string;
  status: string;
  verdict: string;
  passedTests: string;
  totalTests: string;
  runTimeMs: string;
  errorMessage: string;
};

const CAMEL_TASK_SUBMISSION_FIELDS: TaskSubmissionFieldMap = {
  id: "id",
  matchId: "matchId",
  taskId: "taskId",
  userId: "userId",
  language: "language",
  languageVersion: "languageVersion",
  sourceCode: "sourceCode",
  status: "status",
  verdict: "verdict",
  judgeSubmissionId: "judgeSubmissionId",
  judgeStatus: "judgeStatus",
  errorMessage: "errorMessage",
  passedTests: "passedTests",
  totalTests: "totalTests",
  compileTimeMs: "compileTimeMs",
  runTimeMs: "runTimeMs",
  peakMemoryKb: "peakMemoryKb",
  score: "score",
  exitCode: "exitCode",
  compileLog: "compileLog",
  stdoutTruncated: "stdoutTruncated",
  stderrTruncated: "stderrTruncated",
  createdAt: "createdAt",
  startedAt: "startedAt",
  finishedAt: "finishedAt",
  updatedAt: "updatedAt",
  testResults: "testResults",
};

const CAMEL_TASK_SUBMISSION_TEST_FIELDS: TaskSubmissionTestFieldMap = {
  testCaseId: "testCaseId",
  status: "status",
  timeMs: "timeMs",
  memoryKb: "memoryKb",
  exitCode: "exitCode",
  checkerMessage: "checkerMessage",
};

const CAMEL_TASK_SUBMISSION_SUMMARY_FIELDS: TaskSubmissionSummaryFieldMap = {
  id: "id",
  createdAt: "createdAt",
  language: "language",
  status: "status",
  verdict: "verdict",
  passedTests: "passedTests",
  totalTests: "totalTests",
  runTimeMs: "runTimeMs",
  errorMessage: "errorMessage",
};

const SNAKE_TASK_SUBMISSION_FIELDS: TaskSubmissionFieldMap = {
  id: "id",
  matchId: "match_id",
  taskId: "task_id",
  userId: "user_id",
  language: "language",
  languageVersion: "language_version",
  sourceCode: "source_code",
  status: "status",
  verdict: "verdict",
  judgeSubmissionId: "judge_submission_id",
  judgeStatus: "judge_status",
  errorMessage: "error_message",
  passedTests: "passed_tests",
  totalTests: "total_tests",
  compileTimeMs: "compile_time_ms",
  runTimeMs: "run_time_ms",
  peakMemoryKb: "peak_memory_kb",
  score: "score",
  exitCode: "exit_code",
  compileLog: "compile_log",
  stdoutTruncated: "stdout_truncated",
  stderrTruncated: "stderr_truncated",
  createdAt: "created_at",
  startedAt: "started_at",
  finishedAt: "finished_at",
  updatedAt: "updated_at",
  testResults: "test_results",
};

const SNAKE_TASK_SUBMISSION_TEST_FIELDS: TaskSubmissionTestFieldMap = {
  testCaseId: "test_case_id",
  status: "status",
  timeMs: "time_ms",
  memoryKb: "memory_kb",
  exitCode: "exit_code",
  checkerMessage: "checker_message",
};

function parseTaskSubmissionTestResultFromRecord(
  value: unknown,
  fields: TaskSubmissionTestFieldMap,
): TaskSubmissionTestResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const testCaseId = readString(value[fields.testCaseId]).trim();
  const status = readString(value[fields.status]).trim();

  if (!testCaseId || !status) {
    return null;
  }

  const timeMs = readOptionalNumber(value[fields.timeMs]);
  const memoryKb = readOptionalNumber(value[fields.memoryKb]);
  const exitCode = readOptionalNumber(value[fields.exitCode]);
  const checkerMessage = readOptionalString(value[fields.checkerMessage]);

  return {
    testCaseId,
    status,
    ...(timeMs !== undefined ? { timeMs } : {}),
    ...(memoryKb !== undefined ? { memoryKb } : {}),
    ...(exitCode !== undefined ? { exitCode } : {}),
    ...(checkerMessage ? { checkerMessage } : {}),
  };
}

function parseTaskSubmissionFromRecord(
  value: unknown,
  fields: TaskSubmissionFieldMap,
  testFields: TaskSubmissionTestFieldMap,
): TaskSubmission | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value[fields.id]).trim();
  const taskId = readString(value[fields.taskId]).trim();
  const userId = readString(value[fields.userId]).trim();
  const language = readString(value[fields.language]).trim();
  const languageVersion = readString(value[fields.languageVersion]).trim();
  const sourceCode = readString(value[fields.sourceCode]);
  const createdAt = readString(value[fields.createdAt]).trim();
  const updatedAt = readString(value[fields.updatedAt]).trim();
  const status = parseExecutionStatus(value[fields.status]);
  // Backend contract: these counters are always numeric (0 for pre-final states).
  const passedTests = readRequiredNumber(value[fields.passedTests]);
  const totalTests = readRequiredNumber(value[fields.totalTests]);
  const score = readRequiredNumber(value[fields.score]);
  const verdict = parseOptionalVerdict(value[fields.verdict]);
  const judgeStatus = parseOptionalJudgeStatus(value[fields.judgeStatus]);

  if (
    !id ||
    !taskId ||
    !userId ||
    !language ||
    !languageVersion ||
    !status ||
    !createdAt ||
    !updatedAt ||
    passedTests === null ||
    totalTests === null ||
    score === null
  ) {
    return null;
  }

  if (verdict === null || judgeStatus === null) {
    return null;
  }

  const rawTestResults = value[fields.testResults];
  const testResults = Array.isArray(rawTestResults)
    ? rawTestResults
        .map((item: unknown) => parseTaskSubmissionTestResultFromRecord(item, testFields))
        .filter(
          (
            testResult: TaskSubmissionTestResult | null,
          ): testResult is TaskSubmissionTestResult => testResult !== null,
        )
    : [];

  const compileTimeMs = readOptionalNumber(value[fields.compileTimeMs]);
  const runTimeMs = readOptionalNumber(value[fields.runTimeMs]);
  const peakMemoryKb = readOptionalNumber(value[fields.peakMemoryKb]);
  const exitCode = readOptionalNumber(value[fields.exitCode]);
  const matchId = readOptionalString(value[fields.matchId]);
  const judgeSubmissionId = readOptionalString(value[fields.judgeSubmissionId]);
  const errorMessage = readOptionalString(value[fields.errorMessage]);
  const compileLog = readOptionalString(value[fields.compileLog]);
  const stdoutTruncated = readOptionalString(value[fields.stdoutTruncated]);
  const stderrTruncated = readOptionalString(value[fields.stderrTruncated]);
  const startedAt = readOptionalString(value[fields.startedAt]);
  const finishedAt = readOptionalString(value[fields.finishedAt]);

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

function parseTaskSubmissionSummaryFromRecord(
  value: unknown,
  fields: TaskSubmissionSummaryFieldMap,
): TaskSubmissionSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value[fields.id]).trim();
  const createdAt = readString(value[fields.createdAt]).trim();
  const language = readString(value[fields.language]).trim();
  const status = parseExecutionStatus(value[fields.status]);
  const verdict = parseOptionalVerdict(value[fields.verdict]);
  // Backend contract: these counters are always numeric (0 for pre-final states).
  const passedTests = readRequiredNumber(value[fields.passedTests]);
  const totalTests = readRequiredNumber(value[fields.totalTests]);

  if (
    !id ||
    !createdAt ||
    !language ||
    !status ||
    passedTests === null ||
    totalTests === null
  ) {
    return null;
  }

  if (verdict === null) {
    return null;
  }

  const runTimeMs = readOptionalNumber(value[fields.runTimeMs]);
  const errorMessage = readOptionalString(value[fields.errorMessage]);

  return {
    id,
    createdAt,
    language,
    status,
    ...(verdict ? { verdict } : {}),
    passedTests,
    totalTests,
    ...(runTimeMs !== undefined ? { runTimeMs } : {}),
    ...(errorMessage ? { errorMessage } : {}),
  };
}

export function parseTaskSubmissionFromCamelCase(value: unknown) {
  return parseTaskSubmissionFromRecord(
    value,
    CAMEL_TASK_SUBMISSION_FIELDS,
    CAMEL_TASK_SUBMISSION_TEST_FIELDS,
  );
}

export function parseTaskSubmissionFromSnakeCase(value: unknown) {
  return parseTaskSubmissionFromRecord(
    value,
    SNAKE_TASK_SUBMISSION_FIELDS,
    SNAKE_TASK_SUBMISSION_TEST_FIELDS,
  );
}

export function parseTaskSubmissionSummaryFromCamelCase(value: unknown) {
  return parseTaskSubmissionSummaryFromRecord(
    value,
    CAMEL_TASK_SUBMISSION_SUMMARY_FIELDS,
  );
}
