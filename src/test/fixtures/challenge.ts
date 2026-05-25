import type { Challenge, ChallengeLanguage } from "@/entities/challenge";

export function createChallengeFixture(overrides: Partial<Challenge> = {}): Challenge {
  const supportedLanguages: ChallengeLanguage[] = ["typescript", "python"];

  return {
    id: "challenge-1",
    taskId: "task-1",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Medium",
    summary: "Find two numbers with target sum.",
    description: ["Line 1", "Line 2"],
    examples: [],
    constraints: [],
    tags: ["array"],
    category: "Algorithms",
    kind: "algorithmic",
    supportedLanguages,
    languageVersions: {
      typescript: "TypeScript 5.8",
      python: "Python 3.12",
    },
    starterCodeByLanguage: {
      typescript: "function solve() {}",
      python: "def solve():\n    pass",
    },
    acceptanceRate: 52.4,
    estimatedMinutes: 30,
    attempts: 1200,
    popularity: 5000,
    createdAt: "2026-05-25T00:00:00.000Z",
    progress: "not-started",
    testCases: [],
    submissionHistory: [],
    ...overrides,
  };
}
