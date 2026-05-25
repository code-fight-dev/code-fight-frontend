import { describe, expect, it } from "vitest";

import {
  DEFAULT_EXECUTION_OUTPUT_MESSAGE,
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_MS,
  getActionFailureMessage,
  getExecutionActionLabel,
  getExecutionSummaryLines,
  isAbortError,
  isFinalExecutionStatus,
  sortSubmissions,
  toReadableLabel,
  upsertSubmission,
} from "@/features/challenge-execution/model/helpers";
import { createCodeRunFixture, createSubmissionSummaryFixture } from "./fixtures";

describe("challenge-execution helpers", () => {
  it("exposes stable polling defaults", () => {
    expect(POLL_INTERVAL_MS).toBe(1500);
    expect(POLL_TIMEOUT_MS).toBe(120_000);
    expect(DEFAULT_EXECUTION_OUTPUT_MESSAGE).toContain("Choose a testcase");
  });

  it("maps execution action labels", () => {
    expect(getExecutionActionLabel("run")).toBe("Run Code");
    expect(getExecutionActionLabel("submit")).toBe("Submit");
  });

  it("normalizes snake and kebab case values to readable labels", () => {
    expect(toReadableLabel("wrong_answer")).toBe("Wrong Answer");
    expect(toReadableLabel("time-limit_exceeded")).toBe("Time Limit Exceeded");
    expect(toReadableLabel("  pending   queue ")).toBe("Pending Queue");
  });

  it("sorts submissions by createdAt descending and keeps original immutable", () => {
    const oldest = createSubmissionSummaryFixture({
      id: "oldest",
      createdAt: "2026-05-24T10:00:00.000Z",
    });
    const newest = createSubmissionSummaryFixture({
      id: "newest",
      createdAt: "2026-05-26T10:00:00.000Z",
    });
    const invalidDate = createSubmissionSummaryFixture({
      id: "invalid",
      createdAt: "not-a-date",
    });
    const source = [oldest, newest, invalidDate];

    const result = sortSubmissions(source);

    expect(result.map((submission) => submission.id)).toEqual([
      "newest",
      "oldest",
      "invalid",
    ]);
    expect(source.map((submission) => submission.id)).toEqual([
      "oldest",
      "newest",
      "invalid",
    ]);
  });

  it("upserts submission by id and keeps list sorted", () => {
    const older = createSubmissionSummaryFixture({
      id: "submission-1",
      createdAt: "2026-05-24T10:00:00.000Z",
      status: "running",
    });
    const newer = createSubmissionSummaryFixture({
      id: "submission-2",
      createdAt: "2026-05-25T10:00:00.000Z",
    });
    const updated = createSubmissionSummaryFixture({
      id: "submission-1",
      createdAt: "2026-05-26T10:00:00.000Z",
      status: "finished",
    });

    const result = upsertSubmission([older, newer], updated);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "submission-1",
      status: "finished",
    });
    expect(result[1]).toMatchObject({
      id: "submission-2",
    });
  });

  it("detects abort errors and final statuses", () => {
    expect(isAbortError(new DOMException("Aborted", "AbortError"))).toBe(true);
    expect(isAbortError(new Error("nope"))).toBe(false);
    expect(isAbortError("AbortError")).toBe(false);

    expect(isFinalExecutionStatus("finished")).toBe(true);
    expect(isFinalExecutionStatus("failed")).toBe(true);
    expect(isFinalExecutionStatus("running")).toBe(false);
  });

  it("builds detailed execution summary lines", () => {
    const run = createCodeRunFixture({
      status: "finished",
      judgeStatus: "finished",
      verdict: "accepted",
      passedTests: 5,
      totalTests: 5,
      runTimeMs: 47,
      errorMessage: "none",
      stderrTruncated: "trace",
    });

    const summary = getExecutionSummaryLines("Run Code", run, {
      customInputProvided: true,
      timedOut: true,
    });

    expect(summary).toContain("Run Code status: Finished");
    expect(summary).toContain("Judge status: Finished");
    expect(summary).toContain("Verdict: Accepted");
    expect(summary).toContain("Passed tests: 5/5");
    expect(summary).toContain("Runtime: 47 ms");
    expect(summary).toContain("Custom input: Enabled");
    expect(summary).toContain("Error: none");
    expect(summary).toContain("Stderr: trace");
    expect(summary).toContain("Execution is still processing. Refresh later");
  });

  it("formats action failure messages with reason fallback", () => {
    expect(getActionFailureMessage("Run Code", new Error("Judge offline"))).toBe(
      "Run Code failed.\n\nJudge offline",
    );
    expect(getActionFailureMessage("Submit", new Error("   "))).toBe(
      "Submit failed.\n\nUnexpected execution error",
    );
    expect(getActionFailureMessage("Submit", null)).toBe(
      "Submit failed.\n\nUnexpected execution error",
    );
  });
});
