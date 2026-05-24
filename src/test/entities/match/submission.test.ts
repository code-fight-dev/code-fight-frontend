import { describe, expect, it } from "vitest";

import { parseMatchSubmissionFromSnakeCase } from "@/entities/match";

const baseSnakeSubmission = () => ({
  id: "submission-1",
  match_id: "match-1",
  task_id: "task-1",
  user_id: "user-1",
  language: "typescript",
  language_version: "5.8",
  source_code: "console.log('hello')",
  status: "finished",
  verdict: "accepted",
  judge_submission_id: "judge-1",
  judge_status: "finished",
  error_message: "No error",
  passed_tests: 10,
  total_tests: 10,
  compile_time_ms: 120,
  run_time_ms: 300,
  peak_memory_kb: 4096,
  score: 100,
  exit_code: 0,
  compile_log: "Compiled successfully",
  stdout_truncated: "hello",
  stderr_truncated: "warning",
  created_at: "2026-05-24T10:00:00.000Z",
  started_at: "2026-05-24T10:01:00.000Z",
  finished_at: "2026-05-24T10:02:00.000Z",
  updated_at: "2026-05-24T10:03:00.000Z",
  test_results: [
    {
      test_case_id: "test-1",
      status: "passed",
      time_ms: 20,
      memory_kb: 256,
      exit_code: 0,
      checker_message: "ok",
    },
  ],
});

function parseValidSubmission(overrides: Record<string, unknown> = {}) {
  const submission = parseMatchSubmissionFromSnakeCase({
    ...baseSnakeSubmission(),
    ...overrides,
  });

  if (!submission) {
    throw new Error("Expected valid submission fixture to be parsed");
  }

  return submission;
}

describe("parseMatchSubmissionFromSnakeCase", () => {
  it("returns null when value is not a valid object payload", () => {
    expect(parseMatchSubmissionFromSnakeCase(null)).toBeNull();
    expect(parseMatchSubmissionFromSnakeCase(undefined)).toBeNull();
    expect(parseMatchSubmissionFromSnakeCase("submission")).toBeNull();
    expect(parseMatchSubmissionFromSnakeCase(123)).toBeNull();
    expect(parseMatchSubmissionFromSnakeCase([])).toBeNull();
  });

  it("parses a complete snake_case submission into camelCase submission", () => {
    expect(parseMatchSubmissionFromSnakeCase(baseSnakeSubmission())).toStrictEqual({
      id: "submission-1",
      matchId: "match-1",
      taskId: "task-1",
      userId: "user-1",
      language: "typescript",
      languageVersion: "5.8",
      sourceCode: "console.log('hello')",
      status: "finished",
      verdict: "accepted",
      judgeSubmissionId: "judge-1",
      judgeStatus: "finished",
      errorMessage: "No error",
      passedTests: 10,
      totalTests: 10,
      compileTimeMs: 120,
      runTimeMs: 300,
      peakMemoryKb: 4096,
      score: 100,
      exitCode: 0,
      compileLog: "Compiled successfully",
      stdoutTruncated: "hello",
      stderrTruncated: "warning",
      createdAt: "2026-05-24T10:00:00.000Z",
      startedAt: "2026-05-24T10:01:00.000Z",
      finishedAt: "2026-05-24T10:02:00.000Z",
      updatedAt: "2026-05-24T10:03:00.000Z",
      testResults: [
        {
          testCaseId: "test-1",
          status: "passed",
          timeMs: 20,
          memoryKb: 256,
          exitCode: 0,
          checkerMessage: "ok",
        },
      ],
    });
  });

  it("allows empty source code", () => {
    const submission = parseValidSubmission({
      source_code: "",
    });

    expect(submission.sourceCode).toBe("");
  });

  it("omits empty optional string fields", () => {
    const submission = parseValidSubmission({
      match_id: "",
      judge_submission_id: "",
      error_message: "",
      compile_log: "",
      stdout_truncated: "",
      stderr_truncated: "",
      started_at: "",
      finished_at: "",
    });

    expect(submission).not.toHaveProperty("matchId");
    expect(submission).not.toHaveProperty("judgeSubmissionId");
    expect(submission).not.toHaveProperty("errorMessage");
    expect(submission).not.toHaveProperty("compileLog");
    expect(submission).not.toHaveProperty("stdoutTruncated");
    expect(submission).not.toHaveProperty("stderrTruncated");
    expect(submission).not.toHaveProperty("startedAt");
    expect(submission).not.toHaveProperty("finishedAt");
  });

  it("omits undefined optional numeric fields but keeps zero values", () => {
    const submissionWithoutOptionalNumbers = parseValidSubmission({
      compile_time_ms: undefined,
      run_time_ms: undefined,
      peak_memory_kb: undefined,
      exit_code: undefined,
    });

    expect(submissionWithoutOptionalNumbers).not.toHaveProperty("compileTimeMs");
    expect(submissionWithoutOptionalNumbers).not.toHaveProperty("runTimeMs");
    expect(submissionWithoutOptionalNumbers).not.toHaveProperty("peakMemoryKb");
    expect(submissionWithoutOptionalNumbers).not.toHaveProperty("exitCode");

    const submissionWithZeroValues = parseValidSubmission({
      compile_time_ms: 0,
      run_time_ms: 0,
      peak_memory_kb: 0,
      exit_code: 0,
    });

    expect(submissionWithZeroValues.compileTimeMs).toBe(0);
    expect(submissionWithZeroValues.runTimeMs).toBe(0);
    expect(submissionWithZeroValues.peakMemoryKb).toBe(0);
    expect(submissionWithZeroValues.exitCode).toBe(0);
  });

  it("omits empty optional verdict and judge status", () => {
    const submission = parseValidSubmission({
      verdict: "",
      judge_status: "",
    });

    expect(submission).not.toHaveProperty("verdict");
    expect(submission).not.toHaveProperty("judgeStatus");
  });

  it.each([
    ["id", ""],
    ["task_id", ""],
    ["user_id", ""],
    ["language", ""],
    ["language_version", ""],
    ["created_at", ""],
    ["updated_at", ""],
    ["status", "unknown"],
    ["passed_tests", null],
    ["total_tests", null],
    ["score", null],
    ["verdict", "unknown_verdict"],
    ["judge_status", "unknown_judge_status"],
  ])("returns null when required or validated field %s is invalid", (field, value) => {
    expect(
      parseMatchSubmissionFromSnakeCase({
        ...baseSnakeSubmission(),
        [field]: value,
      }),
    ).toBeNull();
  });

  it.each(["queued", "sent_to_judge", "running", "finished", "failed"])(
    "accepts execution status %s",
    (status) => {
      expect(parseValidSubmission({ status }).status).toBe(status);
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
  ])("accepts verdict %s", (verdict) => {
    expect(parseValidSubmission({ verdict }).verdict).toBe(verdict);
  });

  it.each(["pending", "queued", "running", "finished", "failed"])(
    "accepts judge status %s",
    (judgeStatus) => {
      expect(parseValidSubmission({ judge_status: judgeStatus }).judgeStatus).toBe(
        judgeStatus,
      );
    },
  );

  it("uses empty test results when test_results is missing or not an array", () => {
    expect(
      parseValidSubmission({
        test_results: undefined,
      }).testResults,
    ).toStrictEqual([]);

    expect(
      parseValidSubmission({
        test_results: null,
      }).testResults,
    ).toStrictEqual([]);

    expect(
      parseValidSubmission({
        test_results: {},
      }).testResults,
    ).toStrictEqual([]);
  });

  it("parses test results with minimal required fields", () => {
    const submission = parseValidSubmission({
      test_results: [
        {
          test_case_id: "test-1",
          status: "passed",
        },
      ],
    });

    expect(submission.testResults).toStrictEqual([
      {
        testCaseId: "test-1",
        status: "passed",
      },
    ]);
  });

  it("filters invalid test result items", () => {
    const submission = parseValidSubmission({
      test_results: [
        null,
        "invalid",
        {
          test_case_id: "",
          status: "passed",
        },
        {
          test_case_id: "test-2",
          status: "",
        },
        {
          test_case_id: "test-3",
          status: "failed",
          checker_message: "",
        },
      ],
    });

    expect(submission.testResults).toStrictEqual([
      {
        testCaseId: "test-3",
        status: "failed",
      },
    ]);
  });

  it("omits empty checker message in test result", () => {
    const submission = parseValidSubmission({
      test_results: [
        {
          test_case_id: "test-1",
          status: "passed",
          checker_message: "",
        },
      ],
    });

    expect(submission.testResults[0]).toStrictEqual({
      testCaseId: "test-1",
      status: "passed",
    });
  });

  it("keeps zero numeric values in test result", () => {
    const submission = parseValidSubmission({
      test_results: [
        {
          test_case_id: "test-1",
          status: "passed",
          time_ms: 0,
          memory_kb: 0,
          exit_code: 0,
        },
      ],
    });

    expect(submission.testResults).toStrictEqual([
      {
        testCaseId: "test-1",
        status: "passed",
        timeMs: 0,
        memoryKb: 0,
        exitCode: 0,
      },
    ]);
  });
});
