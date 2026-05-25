import { describe, expect, it } from "vitest";

import {
  parseChallengeFromTaskPayload,
  readChallengeErrorMessage,
} from "@/entities/challenge";

describe("parseChallengeFromTaskPayload", () => {
  describe("identity and required fields", () => {
    it("parses a valid challenge payload", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        taskId: "task-1",
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "easy",
        summary: "Find two numbers that add up to target.",
        description: ["Given an array of numbers.", "Return two indices."],
        examples: [
          {
            title: "Example 1",
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] = 9.",
          },
        ],
        constraints: ["2 <= nums.length <= 10^4"],
        notes: ["Use zero-based indexing."],
        tags: ["array", "hash-map"],
        category: "Arrays",
        kind: "algorithmic",
        supportedLanguages: ["javascript", "typescript", "python"],
        languageVersions: {
          JavaScript: "Node.js 22",
          typescript: "TypeScript 5",
          python: "Python 3.12",
          unknown: "ignored",
        },
        starterCodeByLanguage: {
          javascript: "function twoSum(nums, target) {}",
          typescript: "function twoSum(nums: number[], target: number): number[] {}",
          python: "def two_sum(nums, target): pass",
          rust: "ignored because rust is not supported in this challenge",
        },
        acceptanceRate: 53.2,
        estimatedMinutes: 30,
        attempts: 120,
        popularity: 900,
        createdAt: "2026-05-24T12:00:00.000Z",
        progress: "in_progress",
        testCases: [
          {
            name: "basic case",
            input: "[2,7,11,15]\n9",
            expectedOutput: "[0,1]",
            locked: false,
          },
        ],
        submissionHistory: [],
      });

      expect(result).toStrictEqual({
        id: "challenge-1",
        taskId: "task-1",
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        summary: "Find two numbers that add up to target.",
        description: ["Given an array of numbers.", "Return two indices."],
        examples: [
          {
            title: "Example 1",
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] = 9.",
          },
        ],
        constraints: ["2 <= nums.length <= 10^4"],
        notes: ["Use zero-based indexing."],
        tags: ["array", "hash-map"],
        category: "Arrays",
        kind: "algorithmic",
        supportedLanguages: ["javascript", "typescript", "python"],
        languageVersions: {
          javascript: "Node.js 22",
          typescript: "TypeScript 5",
          python: "Python 3.12",
        },
        starterCodeByLanguage: {
          javascript: "function twoSum(nums, target) {}",
          typescript: "function twoSum(nums: number[], target: number): number[] {}",
          python: "def two_sum(nums, target): pass",
        },
        acceptanceRate: 53.2,
        estimatedMinutes: 30,
        attempts: 120,
        popularity: 900,
        createdAt: "2026-05-24T12:00:00.000Z",
        progress: "in-progress",
        testCases: [
          {
            name: "basic case",
            input: "[2,7,11,15]\n9",
            expectedOutput: "[0,1]",
            locked: false,
          },
        ],
        submissionHistory: [],
      });
    });

    it("returns null when payload is not an object", () => {
      expect(parseChallengeFromTaskPayload(null)).toBeNull();
      expect(parseChallengeFromTaskPayload(undefined)).toBeNull();
      expect(parseChallengeFromTaskPayload("invalid")).toBeNull();
      expect(parseChallengeFromTaskPayload(123)).toBeNull();
    });

    it("returns null when required identity fields are missing", () => {
      expect(
        parseChallengeFromTaskPayload({
          slug: "two-sum",
          title: "Two Sum",
        }),
      ).toBeNull();

      expect(
        parseChallengeFromTaskPayload({
          id: "challenge-1",
          title: "Two Sum",
        }),
      ).toBeNull();

      expect(
        parseChallengeFromTaskPayload({
          id: "challenge-1",
          slug: "two-sum",
        }),
      ).toBeNull();
    });

    it("falls back to id when taskId is missing", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
      });

      expect(result?.taskId).toBe("challenge-1");
    });

    it("falls back to id when taskId is empty or whitespace", () => {
      expect(
        parseChallengeFromTaskPayload({
          id: "challenge-1",
          taskId: "",
          slug: "two-sum",
          title: "Two Sum",
        })?.taskId,
      ).toBe("challenge-1");

      expect(
        parseChallengeFromTaskPayload({
          id: "challenge-1",
          taskId: "   ",
          slug: "two-sum",
          title: "Two Sum",
        })?.taskId,
      ).toBe("challenge-1");
    });
  });

  describe("normalization", () => {
    it.each([
      ["easy", "Easy"],
      [" EASY ", "Easy"],
      ["medium", "Medium"],
      ["MEDIUM", "Medium"],
      ["hard", "Hard"],
      ["unknown", "Medium"],
      [null, "Medium"],
    ] as const)("normalizes difficulty %s to %s", (difficulty, expected) => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        difficulty,
      });

      expect(result?.difficulty).toBe(expected);
    });

    it.each([
      ["sql", "sql"],
      [" SQL ", "sql"],
      ["algorithmic", "algorithmic"],
      ["frontend", "algorithmic"],
      [null, "algorithmic"],
    ] as const)("normalizes kind %s to %s", (kind, expected) => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        kind,
      });

      expect(result?.kind).toBe(expected);
    });

    it.each([
      ["in-progress", "in-progress"],
      ["in_progress", "in-progress"],
      ["inprogress", "in-progress"],
      ["solved", "solved"],
      ["completed", "solved"],
      ["accepted", "solved"],
      ["locked", "locked"],
      ["unknown", "not-started"],
      [null, "not-started"],
    ] as const)("normalizes progress %s to %s", (progress, expected) => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        progress,
      });

      expect(result?.progress).toBe(expected);
    });

    it("filters and deduplicates supported languages", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        supportedLanguages: [
          "javascript",
          " JavaScript ",
          "typescript",
          "unknown",
          123,
          null,
        ],
      });

      expect(result?.supportedLanguages).toEqual(["javascript", "typescript"]);
    });

    it("returns empty supported languages when value is not an array", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        supportedLanguages: "javascript",
      });

      expect(result?.supportedLanguages).toEqual([]);
    });

    it("keeps starter code only for supported languages", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        supportedLanguages: ["javascript"],
        starterCodeByLanguage: {
          javascript: "function solve() {}",
          typescript: "ignored",
        },
      });

      expect(result?.starterCodeByLanguage).toEqual({
        javascript: "function solve() {}",
      });
    });

    it("returns empty starter code when starterCodeByLanguage is not an object", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        supportedLanguages: ["javascript"],
        starterCodeByLanguage: null,
      });

      expect(result?.starterCodeByLanguage).toEqual({});
    });

    it("filters invalid language versions", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        languageVersions: {
          JavaScript: "Node.js 22",
          typescript: "",
          python: "   ",
          unknown: "ignored",
          rust: 123,
        },
      });

      expect(result?.languageVersions).toEqual({
        javascript: "Node.js 22",
      });
    });

    it("returns empty language versions when value is not an object", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        languageVersions: null,
      });

      expect(result?.languageVersions).toEqual({});
    });
  });

  describe("nested collections", () => {
    it("filters invalid examples", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        examples: [
          {
            title: "Valid example",
            input: "input",
            output: "output",
          },
          {
            title: "",
            input: "input",
            output: "output",
          },
          {
            title: "Missing input",
            output: "output",
          },
          null,
        ],
      });

      expect(result?.examples).toEqual([
        {
          title: "Valid example",
          input: "input",
          output: "output",
        },
      ]);
    });

    it("returns empty examples when examples is not an array", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        examples: "invalid",
      });

      expect(result?.examples).toEqual([]);
    });

    it("filters invalid test cases", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        testCases: [
          {
            name: "Valid case",
            input: "input",
            expectedOutput: "output",
            locked: true,
          },
          {
            name: "",
            input: "input",
            expectedOutput: "output",
          },
          {
            name: "Missing expected output",
            input: "input",
          },
          null,
        ],
      });

      expect(result?.testCases).toEqual([
        {
          name: "Valid case",
          input: "input",
          expectedOutput: "output",
          locked: true,
        },
      ]);
    });

    it("omits locked from test case when locked is not boolean", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        testCases: [
          {
            name: "Unlocked by default",
            input: "input",
            expectedOutput: "output",
            locked: "false",
          },
        ],
      });

      expect(result?.testCases).toEqual([
        {
          name: "Unlocked by default",
          input: "input",
          expectedOutput: "output",
        },
      ]);
    });

    it("returns empty test cases when testCases is not an array", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        testCases: "invalid",
      });

      expect(result?.testCases).toEqual([]);
    });

    it("filters invalid submission history entries", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        submissionHistory: [null, "invalid", 123],
      });

      expect(result?.submissionHistory).toEqual([]);
    });

    it("returns empty submission history when submissionHistory is not an array", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        submissionHistory: "invalid",
      });

      expect(result?.submissionHistory).toEqual([]);
    });

    it("does not include notes when notes are empty", () => {
      const result = parseChallengeFromTaskPayload({
        id: "challenge-1",
        slug: "two-sum",
        title: "Two Sum",
        notes: [],
      });

      expect(result).not.toHaveProperty("notes");
    });
  });
});

describe("readChallengeErrorMessage", () => {
  it("reads a non-empty error message from response body", () => {
    expect(
      readChallengeErrorMessage(
        {
          error: "Challenge not found",
        },
        "Fallback error",
      ),
    ).toBe("Challenge not found");
  });

  it("returns fallback when body is not an object", () => {
    expect(readChallengeErrorMessage(null, "Fallback error")).toBe("Fallback error");

    expect(readChallengeErrorMessage("invalid", "Fallback error")).toBe("Fallback error");
  });

  it("returns fallback when error is missing or empty", () => {
    expect(readChallengeErrorMessage({}, "Fallback error")).toBe("Fallback error");

    expect(readChallengeErrorMessage({ error: "" }, "Fallback error")).toBe(
      "Fallback error",
    );

    expect(readChallengeErrorMessage({ error: "   " }, "Fallback error")).toBe(
      "Fallback error",
    );
  });
});
