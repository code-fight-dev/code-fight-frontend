import { describe, expect, it } from "vitest";

import { parseCodeRunFromSnakeCase } from "@/entities/challenge";

const createCodeRunPayload = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  id: "run-1",
  task_id: "task-1",
  user_id: "user-1",
  language: "javascript",
  language_version: "Node.js 22",
  status: "queued",
  passed_tests: 0,
  total_tests: 3,
  score: 0,
  created_at: "2026-05-24T12:00:00.000Z",
  updated_at: "2026-05-24T12:01:00.000Z",
  ...overrides,
});

describe("parseCodeRunFromSnakeCase", () => {
  it("parses a minimal valid code run", () => {
    const result = parseCodeRunFromSnakeCase(createCodeRunPayload());

    expect(result).toEqual({
      id: "run-1",
      taskId: "task-1",
      userId: "user-1",
      language: "javascript",
      languageVersion: "Node.js 22",
      status: "queued",
      passedTests: 0,
      totalTests: 3,
      score: 0,
      createdAt: "2026-05-24T12:00:00.000Z",
      updatedAt: "2026-05-24T12:01:00.000Z",
      testResults: [],
    });
  });

  it("parses optional code run fields", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        judge_submission_id: "judge-123",
        error_message: "Runtime error",
        compile_time_ms: 120,
        run_time_ms: 45,
        peak_memory_kb: 2048,
        exit_code: 1,
        compile_log: "Compilation failed",
        stdout_truncated: "stdout",
        stderr_truncated: "stderr",
        started_at: "2026-05-24T12:00:10.000Z",
        finished_at: "2026-05-24T12:00:20.000Z",
      }),
    );

    expect(result).toStrictEqual({
      id: "run-1",
      taskId: "task-1",
      userId: "user-1",
      language: "javascript",
      languageVersion: "Node.js 22",
      status: "queued",
      judgeSubmissionId: "judge-123",
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
      startedAt: "2026-05-24T12:00:10.000Z",
      finishedAt: "2026-05-24T12:00:20.000Z",
      updatedAt: "2026-05-24T12:01:00.000Z",
      testResults: [],
    });
  });

  it("parses valid test results", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        test_results: [
          {
            test_case_id: "case-1",
            test_name: "basic case",
            is_custom: false,
            status: "passed",
            time_ms: 12,
            memory_kb: 512,
            exit_code: 0,
            checker_message: "ok",
          },
          {
            test_case_id: "case-2",
            test_name: "custom case",
            is_custom: true,
            status: "failed",
            time_ms: 20,
            memory_kb: 1024,
            exit_code: 1,
            checker_message: "wrong answer",
          },
          {
            test_case_id: "case-3",
            test_name: "string bool case",
            is_custom: " true ",
            status: "passed",
          },
          {
            test_case_id: "case-4",
            test_name: "string false case",
            is_custom: " FALSE ",
            status: "passed",
          },
          {
            test_case_id: "case-5",
            test_name: "blank string bool case",
            is_custom: "   ",
            status: "passed",
          },
        ],
      }),
    );

    expect(result?.testResults).toEqual([
      {
        testCaseId: "case-1",
        testName: "basic case",
        isCustom: false,
        status: "passed",
        timeMs: 12,
        memoryKb: 512,
        exitCode: 0,
        checkerMessage: "ok",
      },
      {
        testCaseId: "case-2",
        testName: "custom case",
        isCustom: true,
        status: "failed",
        timeMs: 20,
        memoryKb: 1024,
        exitCode: 1,
        checkerMessage: "wrong answer",
      },
      {
        testCaseId: "case-3",
        testName: "string bool case",
        isCustom: true,
        status: "passed",
      },
      {
        testCaseId: "case-4",
        testName: "string false case",
        isCustom: false,
        status: "passed",
      },
      {
        testCaseId: "case-5",
        testName: "blank string bool case",
        isCustom: false,
        status: "passed",
      },
    ]);
  });

  it("defaults test result isCustom to false when it is missing", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        test_results: [
          {
            status: "passed",
          },
        ],
      }),
    );

    expect(result?.testResults).toEqual([
      {
        isCustom: false,
        status: "passed",
      },
    ]);
  });

  it("filters invalid test results", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        test_results: [
          null,
          "invalid",
          {
            status: "",
            is_custom: false,
          },
          {
            is_custom: false,
          },
          {
            status: "   ",
            is_custom: false,
          },
          {
            status: "passed",
            is_custom: false,
          },
          {
            status: "passed",
            is_custom: "invalid",
          },
          {
            status: "passed",
            is_custom: 1,
          },
        ],
      }),
    );

    expect(result?.testResults).toEqual([
      {
        isCustom: false,
        status: "passed",
      },
    ]);
  });

  it("returns empty test results when test_results is not an array", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        test_results: "invalid",
      }),
    );

    expect(result?.testResults).toEqual([]);
  });

  it("returns null when payload is not an object", () => {
    expect(parseCodeRunFromSnakeCase(null)).toBeNull();
    expect(parseCodeRunFromSnakeCase(undefined)).toBeNull();
    expect(parseCodeRunFromSnakeCase("invalid")).toBeNull();
    expect(parseCodeRunFromSnakeCase(123)).toBeNull();
  });

  it.each([
    "id",
    "task_id",
    "user_id",
    "language",
    "language_version",
    "status",
    "created_at",
    "updated_at",
  ])("returns null when required string field %s is missing", (field) => {
    const payload = createCodeRunPayload();

    delete payload[field];

    expect(parseCodeRunFromSnakeCase(payload)).toBeNull();
  });

  it.each([
    "id",
    "task_id",
    "user_id",
    "language",
    "language_version",
    "created_at",
    "updated_at",
  ])("returns null when required string field %s is empty", (field) => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        [field]: "   ",
      }),
    );

    expect(result).toBeNull();
  });

  it.each(["passed_tests", "total_tests", "score"])(
    "returns null when required numeric field %s is missing",
    (field) => {
      const payload = createCodeRunPayload();

      delete payload[field];

      expect(parseCodeRunFromSnakeCase(payload)).toBeNull();
    },
  );

  it.each(["passed_tests", "total_tests", "score"])(
    "returns null when required numeric field %s is invalid",
    (field) => {
      const result = parseCodeRunFromSnakeCase(
        createCodeRunPayload({
          [field]: "invalid",
        }),
      );

      expect(result).toBeNull();
    },
  );

  it("returns null when status is invalid", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        status: "invalid-status",
      }),
    );

    expect(result).toBeNull();
  });

  it("returns null when verdict is invalid", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        verdict: "invalid-verdict",
      }),
    );

    expect(result).toBeNull();
  });

  it.each([
    "accepted",
    "wrong_answer",
    "time_limit_exceeded",
    "memory_limit_exceeded",
    "runtime_error",
    "compile_error",
    "presentation_error",
    "system_error",
  ])("accepts verdict %s", (verdict) => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        verdict,
      }),
    );

    expect(result?.verdict).toBe(verdict);
  });

  it("returns null when judge status is invalid", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        judge_status: "invalid-judge-status",
      }),
    );

    expect(result).toBeNull();
  });

  it.each(["pending", "queued", "running", "finished", "failed"])(
    "accepts judge status %s",
    (judgeStatus) => {
      const result = parseCodeRunFromSnakeCase(
        createCodeRunPayload({
          judge_status: judgeStatus,
        }),
      );

      expect(result?.judgeStatus).toBe(judgeStatus);
    },
  );

  it("omits empty optional string fields", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        judge_submission_id: "",
        error_message: "",
        compile_log: "",
        stdout_truncated: "",
        stderr_truncated: "",
        started_at: "",
        finished_at: "",
      }),
    );

    expect(result).not.toHaveProperty("judgeSubmissionId");
    expect(result).not.toHaveProperty("errorMessage");
    expect(result).not.toHaveProperty("compileLog");
    expect(result).not.toHaveProperty("stdoutTruncated");
    expect(result).not.toHaveProperty("stderrTruncated");
    expect(result).not.toHaveProperty("startedAt");
    expect(result).not.toHaveProperty("finishedAt");
  });

  it("omits invalid optional numeric fields", () => {
    const result = parseCodeRunFromSnakeCase(
      createCodeRunPayload({
        compile_time_ms: "   ",
        run_time_ms: "invalid",
        peak_memory_kb: "invalid",
        exit_code: "invalid",
      }),
    );

    expect(result).not.toHaveProperty("compileTimeMs");
    expect(result).not.toHaveProperty("runTimeMs");
    expect(result).not.toHaveProperty("peakMemoryKb");
    expect(result).not.toHaveProperty("exitCode");
  });
});
