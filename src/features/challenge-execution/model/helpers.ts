import type {
  CodeRun,
  TaskSubmission,
  TaskSubmissionSummary,
} from "@/entities/challenge";
import type { ChallengeExecutionAction } from "./types";

export const POLL_INTERVAL_MS = 1500;
export const POLL_TIMEOUT_MS = 120_000;

export const DEFAULT_EXECUTION_OUTPUT_MESSAGE =
  "Choose a testcase, draft a solution, then run or submit when execution is available.";

export function getExecutionActionLabel(action: ChallengeExecutionAction) {
  return action === "run" ? "Run Code" : "Submit";
}

export function toReadableLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function toTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortSubmissions(submissions: TaskSubmissionSummary[]) {
  return [...submissions].sort(
    (left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt),
  );
}

export function upsertSubmission(
  current: TaskSubmissionSummary[],
  next: TaskSubmissionSummary,
) {
  return sortSubmissions([
    next,
    ...current.filter((submission) => submission.id !== next.id),
  ]);
}

export function isAbortError(error: unknown) {
  if (error instanceof Error) {
    return error.name === "AbortError";
  }

  if (!error || typeof error !== "object" || !("name" in error)) {
    return false;
  }

  return (error as { name: unknown }).name === "AbortError";
}

export function isFinalExecutionStatus(status: string) {
  return status === "finished" || status === "failed";
}

type ExecutionSummaryResult = Pick<
  CodeRun | TaskSubmission,
  | "status"
  | "judgeStatus"
  | "verdict"
  | "passedTests"
  | "totalTests"
  | "runTimeMs"
  | "errorMessage"
  | "stderrTruncated"
>;

export function getExecutionSummaryLines(
  actionLabel: string,
  result: ExecutionSummaryResult,
  options?: {
    customInputProvided?: boolean;
    timedOut?: boolean;
  },
) {
  const lines = [
    `${actionLabel} status: ${toReadableLabel(result.status)}`,
    `Judge status: ${result.judgeStatus ? toReadableLabel(result.judgeStatus) : "Pending"}`,
    `Verdict: ${result.verdict ? toReadableLabel(result.verdict) : "Pending"}`,
    `Passed tests: ${result.passedTests}/${result.totalTests}`,
    `Runtime: ${typeof result.runTimeMs === "number" ? `${result.runTimeMs} ms` : "n/a"}`,
  ];

  if (options?.customInputProvided) {
    lines.push("Custom input: Enabled");
  }

  if (result.errorMessage) {
    lines.push(`Error: ${result.errorMessage}`);
  }

  if (result.stderrTruncated) {
    lines.push(`Stderr: ${result.stderrTruncated}`);
  }

  if (options?.timedOut) {
    lines.push("Execution is still processing. Refresh later to see the final status.");
  }

  return lines.join("\n");
}

export function getActionFailureMessage(actionLabel: string, error: unknown) {
  const reason =
    error instanceof Error && error.message.trim() !== ""
      ? error.message
      : "Unexpected execution error";

  return `${actionLabel} failed.\n\n${reason}`;
}
