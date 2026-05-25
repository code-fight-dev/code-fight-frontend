import type {
  ChallengeLanguage,
  CodeRun,
  TaskSubmission,
  TaskSubmissionSummary,
} from "@/entities/challenge";
import type { ChallengeExecutionSlice } from "@/features/challenge-execution";

export function createSubmissionSummaryFixture(
  overrides: Partial<TaskSubmissionSummary> = {},
): TaskSubmissionSummary {
  return {
    id: "submission-1",
    createdAt: "2026-05-25T10:00:00.000Z",
    language: "typescript",
    status: "finished",
    verdict: "accepted",
    passedTests: 5,
    totalTests: 5,
    runTimeMs: 120,
    ...overrides,
  };
}

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
    judgeStatus: "running",
    passedTests: 1,
    totalTests: 5,
    score: 20,
    createdAt: "2026-05-25T10:00:00.000Z",
    updatedAt: "2026-05-25T10:00:01.000Z",
    testResults: [],
    ...overrides,
  };
}

export function createCodeRunFixture(overrides: Partial<CodeRun> = {}): CodeRun {
  return {
    id: "run-1",
    taskId: "task-1",
    userId: "viewer-1",
    language: "typescript",
    languageVersion: "TypeScript 5.8",
    status: "running",
    judgeStatus: "running",
    passedTests: 1,
    totalTests: 5,
    score: 20,
    createdAt: "2026-05-25T10:00:00.000Z",
    updatedAt: "2026-05-25T10:00:01.000Z",
    testResults: [],
    ...overrides,
  };
}

export function createChallengeExecutionSliceFixture(
  overrides: Partial<ChallengeExecutionSlice> = {},
): ChallengeExecutionSlice {
  return {
    taskId: "task-1",
    languageVersions: {
      typescript: "TypeScript 5.8",
      python: "Python 3.12",
    },
    submissionHistory: [
      createSubmissionSummaryFixture({
        id: "submission-old",
        createdAt: "2026-05-24T10:00:00.000Z",
      }),
      createSubmissionSummaryFixture({
        id: "submission-new",
        createdAt: "2026-05-25T10:00:00.000Z",
      }),
    ],
    ...overrides,
  };
}

export function createExecutionHarnessProps(
  overrides: {
    challenge?: ChallengeExecutionSlice;
    selectedLanguage?: ChallengeLanguage;
    sourceCode?: string;
    customInput?: string;
    onOpenConsole?: () => void;
  } = {},
) {
  return {
    challenge: overrides.challenge ?? createChallengeExecutionSliceFixture(),
    selectedLanguage: overrides.selectedLanguage ?? "typescript",
    sourceCode: overrides.sourceCode ?? "function solve() { return 42; }",
    customInput: overrides.customInput ?? "",
    onOpenConsole: overrides.onOpenConsole ?? (() => {}),
  };
}
