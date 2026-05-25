import { describe, expect, it } from "vitest";

import {
  formatSubmissionMessage,
  INITIAL_OUTPUT_MESSAGE,
  isFinalSubmissionStatus,
  toReadableLabel,
} from "@/features/arena-room/model/formatters";
import { createTaskSubmissionFixture } from "./fixtures";

describe("arena-room formatters", () => {
  describe("toReadableLabel", () => {
    it("normalizes snake_case and kebab-case labels", () => {
      expect(toReadableLabel("time_limit-exceeded")).toBe("Time Limit Exceeded");
      expect(toReadableLabel("  runtime_error  ")).toBe("Runtime Error");
    });
  });

  describe("isFinalSubmissionStatus", () => {
    it("returns true only for final statuses", () => {
      expect(isFinalSubmissionStatus("finished")).toBe(true);
      expect(isFinalSubmissionStatus("failed")).toBe(true);
      expect(isFinalSubmissionStatus("running")).toBe(false);
      expect(isFinalSubmissionStatus("queued")).toBe(false);
    });
  });

  describe("formatSubmissionMessage", () => {
    it("renders pending verdict when verdict is missing", () => {
      const message = formatSubmissionMessage(
        createTaskSubmissionFixture({
          id: "s-1",
          status: "running",
          verdict: undefined,
          passedTests: 1,
          totalTests: 5,
          score: 20,
        }),
      );

      expect(message).toContain("Submission #s-1");
      expect(message).toContain("Status: Running");
      expect(message).toContain("Verdict: pending");
      expect(message).toContain("Passed tests: 1/5");
      expect(message).toContain("Score: 20");
    });

    it("includes runtime, error and timeout hint when available", () => {
      const message = formatSubmissionMessage(
        createTaskSubmissionFixture({
          id: "s-2",
          status: "finished",
          verdict: "accepted",
          runTimeMs: 120,
          errorMessage: "Example warning",
        }),
        { timedOut: true },
      );

      expect(message).toContain("Verdict: Accepted");
      expect(message).toContain("Runtime: 120 ms");
      expect(message).toContain("Error: Example warning");
      expect(message).toContain("Judge is taking longer than expected.");
    });
  });

  it("keeps a stable initial output message", () => {
    expect(INITIAL_OUTPUT_MESSAGE).toBe("Submit your first solution to start the duel.");
  });
});
