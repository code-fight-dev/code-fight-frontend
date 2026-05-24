import { describe, expect, it } from "vitest";

import {
  parseExecutionStatus,
  parseJudgeStatus,
  parseTaskSubmissionFromCamelCase,
  parseTaskSubmissionFromSnakeCase,
  parseTaskSubmissionSummaryFromCamelCase,
  parseVerdict,
  toTaskSubmissionSummary,
} from "@/entities/challenge";

type SubmissionInput = Parameters<typeof toTaskSubmissionSummary>[0];

function createSubmissionInput(
  overrides: Partial<SubmissionInput> = {},
): SubmissionInput {
  return {
    id: "submission-1",
    createdAt: "2026-05-24T12:00:00.000Z",
    language: "typescript",
    status: "finished",
    passedTests: 7,
    totalTests: 10,
    ...overrides,
  };
}

function createSnakeSubmissionPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "submission-1",
    task_id: "task-1",
    user_id: "user-1",
    language: "typescript",
    language_version: "TypeScript 5.0",
    source_code: "console.log('hello')",
    status: "queued",
    passed_tests: 0,
    total_tests: 3,
    score: 0,
    created_at: "2026-05-24T12:00:00.000Z",
    updated_at: "2026-05-24T12:00:10.000Z",
    ...overrides,
  };
}

function createCamelSubmissionPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "submission-1",
    taskId: "task-1",
    userId: "user-1",
    language: "typescript",
    languageVersion: "TypeScript 5.0",
    sourceCode: "console.log('hello')",
    status: "queued",
    passedTests: 0,
    totalTests: 3,
    score: 0,
    createdAt: "2026-05-24T12:00:00.000Z",
    updatedAt: "2026-05-24T12:00:10.000Z",
    ...overrides,
  };
}

function createSubmissionSummaryPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "submission-1",
    createdAt: "2026-05-24T12:00:00.000Z",
    language: "typescript",
    status: "finished",
    passedTests: 7,
    totalTests: 10,
    ...overrides,
  };
}

describe("toTaskSubmissionSummary", () => {
  it("maps required submission fields to summary", () => {
    const summary = toTaskSubmissionSummary(createSubmissionInput());

    expect(summary).toEqual({
      id: "submission-1",
      createdAt: "2026-05-24T12:00:00.000Z",
      language: "typescript",
      status: "finished",
      passedTests: 7,
      totalTests: 10,
    });
  });

  it("includes verdict when it is present", () => {
    const summary = toTaskSubmissionSummary(
      createSubmissionInput({
        verdict: "accepted",
        passedTests: 10,
        totalTests: 10,
      }),
    );

    expect(summary).toMatchObject({
      verdict: "accepted",
    });
  });

  it("does not include verdict when it is missing", () => {
    const summary = toTaskSubmissionSummary(
      createSubmissionInput({
        verdict: undefined,
      }),
    );

    expect(summary).not.toHaveProperty("verdict");
  });

  it("includes runTimeMs when it is a number", () => {
    const summary = toTaskSubmissionSummary(
      createSubmissionInput({
        runTimeMs: 128,
        passedTests: 10,
        totalTests: 10,
      }),
    );

    expect(summary).toMatchObject({
      runTimeMs: 128,
    });
  });

  it("includes runTimeMs when it is zero", () => {
    const summary = toTaskSubmissionSummary(
      createSubmissionInput({
        runTimeMs: 0,
        passedTests: 10,
        totalTests: 10,
      }),
    );

    expect(summary).toMatchObject({
      runTimeMs: 0,
    });
  });

  it("does not include runTimeMs when it is missing", () => {
    const summary = toTaskSubmissionSummary(
      createSubmissionInput({
        runTimeMs: undefined,
      }),
    );

    expect(summary).not.toHaveProperty("runTimeMs");
  });

  it("includes errorMessage when it is present", () => {
    const summary = toTaskSubmissionSummary(
      createSubmissionInput({
        status: "failed",
        passedTests: 0,
        totalTests: 10,
        errorMessage: "Compilation failed",
      }),
    );

    expect(summary).toMatchObject({
      errorMessage: "Compilation failed",
    });
  });

  it("does not include errorMessage when it is empty", () => {
    const summary = toTaskSubmissionSummary(
      createSubmissionInput({
        errorMessage: "",
      }),
    );

    expect(summary).not.toHaveProperty("errorMessage");
  });

  it("includes all optional fields when they are present", () => {
    const summary = toTaskSubmissionSummary(
      createSubmissionInput({
        status: "finished",
        verdict: "wrong_answer",
        passedTests: 8,
        totalTests: 10,
        runTimeMs: 256,
        errorMessage: "Wrong answer on test 9",
      }),
    );

    expect(summary).toEqual({
      id: "submission-1",
      createdAt: "2026-05-24T12:00:00.000Z",
      language: "typescript",
      status: "finished",
      verdict: "wrong_answer",
      passedTests: 8,
      totalTests: 10,
      runTimeMs: 256,
      errorMessage: "Wrong answer on test 9",
    });
  });
});

describe("parseTaskSubmissionFromSnakeCase", () => {
  it("parses a minimal valid submission with numeric strings", () => {
    const result = parseTaskSubmissionFromSnakeCase(
      createSnakeSubmissionPayload({
        passed_tests: "0",
        total_tests: "3",
        score: "0",
      }),
    );

    expect(result).toEqual({
      id: "submission-1",
      taskId: "task-1",
      userId: "user-1",
      language: "typescript",
      languageVersion: "TypeScript 5.0",
      sourceCode: "console.log('hello')",
      status: "queued",
      passedTests: 0,
      totalTests: 3,
      score: 0,
      createdAt: "2026-05-24T12:00:00.000Z",
      updatedAt: "2026-05-24T12:00:10.000Z",
      testResults: [],
    });
  });

  it("parses optional fields and keeps only valid test results", () => {
    const result = parseTaskSubmissionFromSnakeCase(
      createSnakeSubmissionPayload({
        match_id: "match-1",
        verdict: "accepted",
        judge_submission_id: "judge-123",
        judge_status: "running",
        error_message: "Runtime error",
        compile_time_ms: "120",
        run_time_ms: "45",
        peak_memory_kb: "2048",
        exit_code: "1",
        compile_log: "Compilation failed",
        stdout_truncated: "stdout",
        stderr_truncated: "stderr",
        started_at: "2026-05-24T12:00:01.000Z",
        finished_at: "2026-05-24T12:00:05.000Z",
        test_results: [
          {
            test_case_id: "case-1",
            status: "passed",
            time_ms: 10,
            memory_kb: 512,
            exit_code: 0,
            checker_message: "ok",
          },
          {
            test_case_id: "case-2",
            status: "failed",
            time_ms: "12",
            memory_kb: "1024",
            exit_code: "1",
            checker_message: "wrong answer",
          },
          {
            test_case_id: "case-3",
            status: "passed",
            checker_message: "",
          },
          null,
          {
            status: "passed",
          },
          {
            test_case_id: "   ",
            status: "failed",
          },
        ],
      }),
    );

    expect(result).toStrictEqual({
      id: "submission-1",
      matchId: "match-1",
      taskId: "task-1",
      userId: "user-1",
      language: "typescript",
      languageVersion: "TypeScript 5.0",
      sourceCode: "console.log('hello')",
      status: "queued",
      verdict: "accepted",
      judgeSubmissionId: "judge-123",
      judgeStatus: "running",
      errorMessage: "Runtime error",
      passedTests: 0,
      totalTests: 3,
      compileTimeMs: 120,
      runTimeMs: 45,
      peakMemoryKb: 2048,
      score: 0,
      exitCode: 1,
      compileLog: "Compilation failed",
      stdoutTruncated: "stdout",
      stderrTruncated: "stderr",
      createdAt: "2026-05-24T12:00:00.000Z",
      startedAt: "2026-05-24T12:00:01.000Z",
      finishedAt: "2026-05-24T12:00:05.000Z",
      updatedAt: "2026-05-24T12:00:10.000Z",
      testResults: [
        {
          testCaseId: "case-1",
          status: "passed",
          timeMs: 10,
          memoryKb: 512,
          exitCode: 0,
          checkerMessage: "ok",
        },
        {
          testCaseId: "case-2",
          status: "failed",
          timeMs: 12,
          memoryKb: 1024,
          exitCode: 1,
          checkerMessage: "wrong answer",
        },
        {
          testCaseId: "case-3",
          status: "passed",
        },
      ],
    });
  });

  it("omits optional verdict and judge status when they are blank", () => {
    const result = parseTaskSubmissionFromSnakeCase(
      createSnakeSubmissionPayload({
        verdict: "   ",
        judge_status: "   ",
      }),
    );

    expect(result).not.toHaveProperty("verdict");
    expect(result).not.toHaveProperty("judgeStatus");
  });

  it("returns null when verdict is not a string", () => {
    const result = parseTaskSubmissionFromSnakeCase(
      createSnakeSubmissionPayload({
        verdict: 123,
      }),
    );

    expect(result).toBeNull();
  });

  it("returns null when judge status is invalid", () => {
    const result = parseTaskSubmissionFromSnakeCase(
      createSnakeSubmissionPayload({
        judge_status: "invalid-status",
      }),
    );

    expect(result).toBeNull();
  });

  it("returns null when required numeric fields are invalid", () => {
    const result = parseTaskSubmissionFromSnakeCase(
      createSnakeSubmissionPayload({
        passed_tests: "not-a-number",
      }),
    );

    expect(result).toBeNull();
  });

  it("returns null when payload is not an object", () => {
    expect(parseTaskSubmissionFromSnakeCase(null)).toBeNull();
    expect(parseTaskSubmissionFromSnakeCase("invalid")).toBeNull();
  });
});

describe("parseTaskSubmissionFromCamelCase", () => {
  it("parses a valid camelCase payload", () => {
    const result = parseTaskSubmissionFromCamelCase(
      createCamelSubmissionPayload({
        verdict: "wrong_answer",
        judgeStatus: "finished",
        testResults: [
          {
            testCaseId: "camel-1",
            status: "failed",
            timeMs: 31,
          },
        ],
      }),
    );

    expect(result).toEqual({
      id: "submission-1",
      taskId: "task-1",
      userId: "user-1",
      language: "typescript",
      languageVersion: "TypeScript 5.0",
      sourceCode: "console.log('hello')",
      status: "queued",
      verdict: "wrong_answer",
      judgeStatus: "finished",
      passedTests: 0,
      totalTests: 3,
      score: 0,
      createdAt: "2026-05-24T12:00:00.000Z",
      updatedAt: "2026-05-24T12:00:10.000Z",
      testResults: [
        {
          testCaseId: "camel-1",
          status: "failed",
          timeMs: 31,
        },
      ],
    });
  });
});

describe("parseTaskSubmissionSummaryFromCamelCase", () => {
  it("parses a valid summary payload", () => {
    const result = parseTaskSubmissionSummaryFromCamelCase(
      createSubmissionSummaryPayload({
        verdict: "accepted",
        runTimeMs: "128",
        errorMessage: "Optional message",
      }),
    );

    expect(result).toEqual({
      id: "submission-1",
      createdAt: "2026-05-24T12:00:00.000Z",
      language: "typescript",
      status: "finished",
      verdict: "accepted",
      passedTests: 7,
      totalTests: 10,
      runTimeMs: 128,
      errorMessage: "Optional message",
    });
  });

  it("omits optional verdict and error message when they are blank", () => {
    const result = parseTaskSubmissionSummaryFromCamelCase(
      createSubmissionSummaryPayload({
        verdict: "   ",
        errorMessage: "",
      }),
    );

    expect(result).not.toHaveProperty("verdict");
    expect(result).not.toHaveProperty("errorMessage");
  });

  it("returns null when summary payload has invalid required fields", () => {
    const result = parseTaskSubmissionSummaryFromCamelCase(
      createSubmissionSummaryPayload({
        status: "invalid-status",
      }),
    );

    expect(result).toBeNull();
  });

  it("returns null when verdict type is invalid", () => {
    const result = parseTaskSubmissionSummaryFromCamelCase(
      createSubmissionSummaryPayload({
        verdict: true,
      }),
    );

    expect(result).toBeNull();
  });
});

describe("execution enum parsers", () => {
  it.each(["queued", "sent_to_judge", "running", "finished", "failed"])(
    "parses execution status %s",
    (value) => {
      expect(parseExecutionStatus(value)).toBe(value);
    },
  );

  it("returns null for empty judge status and verdict values", () => {
    expect(parseJudgeStatus("   ")).toBeNull();
    expect(parseVerdict("   ")).toBeNull();
  });

  it.each(["pending", "queued", "running", "finished", "failed"])(
    "parses judge status %s",
    (value) => {
      expect(parseJudgeStatus(value)).toBe(value);
    },
  );

  it.each([
    "accepted",
    "wrong_answer",
    "time_limit_exceeded",
    "memory_limit_exceeded",
    "runtime_error",
    "compile_error",
    "presentation_error",
    "system_error",
  ])("parses verdict %s", (value) => {
    expect(parseVerdict(value)).toBe(value);
  });
});
