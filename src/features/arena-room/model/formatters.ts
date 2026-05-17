import type { TaskSubmission } from "@/entities/challenge";

export const INITIAL_OUTPUT_MESSAGE = "Submit your first solution to start the duel.";

export function toReadableLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function isFinalSubmissionStatus(status: string) {
  return status === "finished" || status === "failed";
}

export function formatSubmissionMessage(
  submission: TaskSubmission,
  options?: { timedOut?: boolean },
) {
  const lines = [
    `Submission #${submission.id}`,
    `Status: ${toReadableLabel(submission.status)}`,
    submission.verdict
      ? `Verdict: ${toReadableLabel(submission.verdict)}`
      : "Verdict: pending",
    `Passed tests: ${submission.passedTests}/${submission.totalTests}`,
    `Score: ${submission.score}`,
  ];

  if (typeof submission.runTimeMs === "number") {
    lines.push(`Runtime: ${submission.runTimeMs} ms`);
  }

  if (submission.errorMessage) {
    lines.push(`Error: ${submission.errorMessage}`);
  }

  if (options?.timedOut) {
    lines.push(
      "Judge is taking longer than expected. Refreshing continues in background.",
    );
  }

  return lines.join("\n");
}
