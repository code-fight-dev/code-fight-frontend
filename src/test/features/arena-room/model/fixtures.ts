import type { TaskSubmission } from "@/entities/challenge";
import type { Match, MatchSubmission } from "@/entities/match";
import { createMatchFixture } from "@/test/entities/match/match.test-helpers";
import { createChallengeFixture } from "@/test/fixtures/challenge";
import { createViewerFixture } from "@/test/fixtures/viewer";

export function createArenaMatchFixture(overrides: Partial<Match> = {}): Match {
  return createMatchFixture({
    taskId: "task-1",
    status: "running",
    judgeStatus: "running",
    ...overrides,
  });
}

export { createChallengeFixture };

export function createTaskSubmissionFixture(
  overrides: Partial<TaskSubmission> = {},
): TaskSubmission {
  return {
    id: "submission-1",
    taskId: "task-1",
    userId: "viewer-1",
    language: "typescript",
    languageVersion: "TypeScript 5.8",
    sourceCode: "function solve() {}",
    status: "running",
    passedTests: 1,
    totalTests: 5,
    score: 20,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:01.000Z",
    testResults: [],
    ...overrides,
  };
}

export function createMatchSubmissionFixture(
  overrides: Partial<MatchSubmission> = {},
): MatchSubmission {
  return {
    id: "match-submission-1",
    matchId: "match-1",
    taskId: "task-1",
    userId: "viewer-1",
    language: "typescript",
    languageVersion: "TypeScript 5.8",
    sourceCode: "function solve() {}",
    status: "running",
    passedTests: 1,
    totalTests: 5,
    score: 20,
    createdAt: "2026-05-25T00:00:00.000Z",
    updatedAt: "2026-05-25T00:00:01.000Z",
    testResults: [],
    ...overrides,
  };
}

export { createViewerFixture };
