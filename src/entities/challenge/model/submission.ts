import type { TaskSubmission, TaskSubmissionSummary } from "./types";

export function toTaskSubmissionSummary(
  submission: Pick<
    TaskSubmission,
    | "id"
    | "createdAt"
    | "language"
    | "status"
    | "verdict"
    | "passedTests"
    | "totalTests"
    | "runTimeMs"
    | "errorMessage"
  >,
): TaskSubmissionSummary {
  return {
    id: submission.id,
    createdAt: submission.createdAt,
    language: submission.language,
    status: submission.status,
    ...(submission.verdict ? { verdict: submission.verdict } : {}),
    passedTests: submission.passedTests,
    totalTests: submission.totalTests,
    ...(typeof submission.runTimeMs === "number"
      ? { runTimeMs: submission.runTimeMs }
      : {}),
    ...(submission.errorMessage ? { errorMessage: submission.errorMessage } : {}),
  };
}
