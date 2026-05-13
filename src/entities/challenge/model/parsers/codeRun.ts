import type { CodeRun, CodeRunTestResult } from "../types";
import { parseExecutionStatus } from "./enums";
import {
  isRecord,
  readOptionalBoolean,
  readOptionalNumber,
  readOptionalString,
  readRequiredNumber,
  readString,
} from "./scalars";
import { parseOptionalJudgeStatus, parseOptionalVerdict } from "./optionalEnums";

type CodeRunFieldMap = {
  id: string;
  taskId: string;
  userId: string;
  language: string;
  languageVersion: string;
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

type CodeRunTestFieldMap = {
  testCaseId: string;
  testName: string;
  isCustom: string;
  status: string;
  timeMs: string;
  memoryKb: string;
  exitCode: string;
  checkerMessage: string;
};

const SNAKE_CODE_RUN_FIELDS: CodeRunFieldMap = {
  id: "id",
  taskId: "task_id",
  userId: "user_id",
  language: "language",
  languageVersion: "language_version",
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

const SNAKE_CODE_RUN_TEST_FIELDS: CodeRunTestFieldMap = {
  testCaseId: "test_case_id",
  testName: "test_name",
  isCustom: "is_custom",
  status: "status",
  timeMs: "time_ms",
  memoryKb: "memory_kb",
  exitCode: "exit_code",
  checkerMessage: "checker_message",
};

function parseCodeRunTestResultFromRecord(
  value: unknown,
  fields: CodeRunTestFieldMap,
): CodeRunTestResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const status = readString(value[fields.status]).trim();
  if (!status) {
    return null;
  }

  const isCustom = readOptionalBoolean(value[fields.isCustom]);
  if (isCustom === null) {
    return null;
  }

  const testCaseId = readOptionalString(value[fields.testCaseId]);
  const testName = readOptionalString(value[fields.testName]);
  const timeMs = readOptionalNumber(value[fields.timeMs]);
  const memoryKb = readOptionalNumber(value[fields.memoryKb]);
  const exitCode = readOptionalNumber(value[fields.exitCode]);
  const checkerMessage = readOptionalString(value[fields.checkerMessage]);

  return {
    ...(testCaseId ? { testCaseId } : {}),
    ...(testName ? { testName } : {}),
    isCustom: isCustom ?? false,
    status,
    ...(timeMs !== undefined ? { timeMs } : {}),
    ...(memoryKb !== undefined ? { memoryKb } : {}),
    ...(exitCode !== undefined ? { exitCode } : {}),
    ...(checkerMessage ? { checkerMessage } : {}),
  };
}

function parseCodeRunFromRecord(
  value: unknown,
  fields: CodeRunFieldMap,
  testFields: CodeRunTestFieldMap,
): CodeRun | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value[fields.id]).trim();
  const taskId = readString(value[fields.taskId]).trim();
  const userId = readString(value[fields.userId]).trim();
  const language = readString(value[fields.language]).trim();
  const languageVersion = readString(value[fields.languageVersion]).trim();
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
        .map((item: unknown) => parseCodeRunTestResultFromRecord(item, testFields))
        .filter(
          (testResult: CodeRunTestResult | null): testResult is CodeRunTestResult =>
            testResult !== null,
        )
    : [];

  const compileTimeMs = readOptionalNumber(value[fields.compileTimeMs]);
  const runTimeMs = readOptionalNumber(value[fields.runTimeMs]);
  const peakMemoryKb = readOptionalNumber(value[fields.peakMemoryKb]);
  const exitCode = readOptionalNumber(value[fields.exitCode]);
  const judgeSubmissionId = readOptionalString(value[fields.judgeSubmissionId]);
  const errorMessage = readOptionalString(value[fields.errorMessage]);
  const compileLog = readOptionalString(value[fields.compileLog]);
  const stdoutTruncated = readOptionalString(value[fields.stdoutTruncated]);
  const stderrTruncated = readOptionalString(value[fields.stderrTruncated]);
  const startedAt = readOptionalString(value[fields.startedAt]);
  const finishedAt = readOptionalString(value[fields.finishedAt]);

  return {
    id,
    taskId,
    userId,
    language,
    languageVersion,
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

export function parseCodeRunFromSnakeCase(value: unknown) {
  return parseCodeRunFromRecord(value, SNAKE_CODE_RUN_FIELDS, SNAKE_CODE_RUN_TEST_FIELDS);
}
