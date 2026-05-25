import { describe, expect, it } from "vitest";

import { toTaskSubmissionFromMatchSubmission } from "@/features/arena-room/model/adapters";
import { createMatchSubmissionFixture } from "./fixtures";

describe("toTaskSubmissionFromMatchSubmission", () => {
  it("maps full submission payload with optional fields", () => {
    const taskSubmission = toTaskSubmissionFromMatchSubmission(
      createMatchSubmissionFixture({
        verdict: "accepted",
        judgeSubmissionId: "judge-1",
        judgeStatus: "finished",
        errorMessage: "warning",
        compileTimeMs: 0,
        runTimeMs: 150,
        peakMemoryKb: 2048,
        exitCode: 0,
        compileLog: "compiled",
        stdoutTruncated: "stdout",
        stderrTruncated: "stderr",
        startedAt: "2026-05-25T00:00:01.000Z",
        finishedAt: "2026-05-25T00:00:02.000Z",
        testResults: [
          {
            testCaseId: "case-1",
            status: "passed",
            timeMs: 0,
            memoryKb: 512,
            exitCode: 0,
            checkerMessage: "ok",
          },
        ],
      }),
    );

    expect(taskSubmission).toStrictEqual({
      id: "match-submission-1",
      matchId: "match-1",
      taskId: "task-1",
      userId: "viewer-1",
      language: "typescript",
      languageVersion: "TypeScript 5.8",
      sourceCode: "function solve() {}",
      status: "running",
      verdict: "accepted",
      judgeSubmissionId: "judge-1",
      judgeStatus: "finished",
      errorMessage: "warning",
      passedTests: 1,
      totalTests: 5,
      compileTimeMs: 0,
      runTimeMs: 150,
      peakMemoryKb: 2048,
      score: 20,
      exitCode: 0,
      compileLog: "compiled",
      stdoutTruncated: "stdout",
      stderrTruncated: "stderr",
      createdAt: "2026-05-25T00:00:00.000Z",
      startedAt: "2026-05-25T00:00:01.000Z",
      finishedAt: "2026-05-25T00:00:02.000Z",
      updatedAt: "2026-05-25T00:00:01.000Z",
      testResults: [
        {
          testCaseId: "case-1",
          status: "passed",
          timeMs: 0,
          memoryKb: 512,
          exitCode: 0,
          checkerMessage: "ok",
        },
      ],
    });
  });

  it("omits empty optional strings and undefined numeric fields", () => {
    const taskSubmission = toTaskSubmissionFromMatchSubmission(
      createMatchSubmissionFixture({
        matchId: undefined,
        verdict: undefined,
        judgeSubmissionId: "",
        judgeStatus: undefined,
        errorMessage: "",
        compileTimeMs: undefined,
        runTimeMs: undefined,
        peakMemoryKb: undefined,
        exitCode: undefined,
        compileLog: "",
        stdoutTruncated: "",
        stderrTruncated: "",
        startedAt: "",
        finishedAt: "",
        testResults: [
          {
            testCaseId: "case-1",
            status: "failed",
            checkerMessage: "",
          },
        ],
      }),
    );

    expect(taskSubmission).not.toHaveProperty("matchId");
    expect(taskSubmission).not.toHaveProperty("verdict");
    expect(taskSubmission).not.toHaveProperty("judgeSubmissionId");
    expect(taskSubmission).not.toHaveProperty("judgeStatus");
    expect(taskSubmission).not.toHaveProperty("errorMessage");
    expect(taskSubmission).not.toHaveProperty("compileTimeMs");
    expect(taskSubmission).not.toHaveProperty("runTimeMs");
    expect(taskSubmission).not.toHaveProperty("peakMemoryKb");
    expect(taskSubmission).not.toHaveProperty("exitCode");
    expect(taskSubmission).not.toHaveProperty("compileLog");
    expect(taskSubmission).not.toHaveProperty("stdoutTruncated");
    expect(taskSubmission).not.toHaveProperty("stderrTruncated");
    expect(taskSubmission).not.toHaveProperty("startedAt");
    expect(taskSubmission).not.toHaveProperty("finishedAt");
    expect(taskSubmission.testResults[0]).toEqual({
      testCaseId: "case-1",
      status: "failed",
    });
  });
});
