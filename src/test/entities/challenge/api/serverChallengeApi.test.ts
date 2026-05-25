import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getChallengeBySlug, getChallenges } from "@/entities/challenge/server";

const serverMocks = vi.hoisted(() => ({
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: serverMocks.headers,
}));

function createChallengeListItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "task-1",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    summary: "Find two numbers",
    tags: ["array"],
    category: "Arrays",
    kind: "algorithmic",
    supportedLanguages: ["javascript"],
    acceptanceRate: 53.2,
    estimatedMinutes: 30,
    attempts: 120,
    popularity: 900,
    createdAt: "2026-05-24T12:00:00.000Z",
    progress: "not_started",
    ...overrides,
  };
}

function createChallengeTaskPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "task-1",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "hard",
    summary: "Find two numbers that sum to target.",
    description: ["Given an array", 1],
    examples: [
      {
        title: "Example 1",
        input: "nums=[2,7,11,15], target=9",
        output: "[0,1]",
        explanation: "Use hash map",
      },
      {
        title: "Example 2",
        input: "nums=[3,3], target=6",
        output: "[0,1]",
        explanation: "   ",
      },
      {
        title: "",
        input: "invalid",
        output: "invalid",
      },
    ],
    constraints: ["2 <= nums.length <= 1e4", 123],
    notes: ["Use zero-based index", false],
    tags: ["array", "hash-map", 1],
    category: "Arrays",
    kind: "sql",
    supportedLanguages: [" JavaScript ", "typescript", "unknown", "javascript"],
    languageVersions: {
      JavaScript: "Node.js 22",
      typescript: "TypeScript 5",
      python: "   ",
      unknown: "ignored",
    },
    starterCodeByLanguage: {
      javascript: "function solve() {}",
      typescript: "function solve(): void {}",
      python: "def solve(): pass",
    },
    acceptanceRate: "53.2",
    estimatedMinutes: "30",
    attempts: "120",
    popularity: "900",
    createdAt: "2026-05-24T12:00:00.000Z",
    progress: "accepted",
    testCases: [
      {
        name: "basic",
        input: "input",
        expectedOutput: "output",
        locked: true,
      },
      {
        name: "no-lock",
        input: "input",
        expectedOutput: "output",
        locked: "false",
      },
      {
        name: "",
        input: "bad",
        expectedOutput: "bad",
      },
    ],
    submissionHistory: [
      {
        id: "sub-1",
        createdAt: "2026-05-24T12:10:00.000Z",
        language: "typescript",
        status: "finished",
        verdict: "accepted",
        passedTests: 10,
        totalTests: 10,
        runTimeMs: 30,
      },
      {
        id: "broken",
      },
    ],
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("challenge server api", () => {
  beforeEach(() => {
    serverMocks.headers.mockReset();
    serverMocks.headers.mockResolvedValue(new Headers());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("getChallenges", () => {
    it("throws when request fails", async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallenges()).rejects.toThrow("Failed to fetch challenges");
    });

    it("throws when response shape is invalid", async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ items: "invalid" }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallenges()).rejects.toThrow("Invalid challenges response");
    });

    it("throws when response body is malformed JSON", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response("broken", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallenges()).rejects.toThrow("Invalid challenges response");
    });

    it("parses, normalizes and filters challenges list", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          items: [
            null,
            createChallengeListItem({
              id: "task-1",
              difficulty: "easy",
              kind: " SQL ",
              progress: "inprogress",
              supportedLanguages: [
                " JavaScript ",
                "typescript",
                "unknown",
                "javascript",
                42,
              ],
            }),
            createChallengeListItem({
              id: "task-2",
              slug: "binary-search",
              title: "Binary Search",
              difficulty: "hard",
              kind: "algorithmic",
              progress: "completed",
              supportedLanguages: ["typescript"],
            }),
            createChallengeListItem({
              id: "task-3",
              slug: "rotate-array",
              title: "Rotate Array",
              difficulty: "medium",
              kind: "frontend",
              progress: "locked",
              supportedLanguages: ["javascript"],
            }),
            createChallengeListItem({
              id: "task-4",
              slug: "unknown-progress",
              title: "Unknown Progress",
              difficulty: "extreme",
              kind: "anything",
              progress: "unknown",
              supportedLanguages: ["javascript"],
            }),
            createChallengeListItem({
              id: "",
            }),
            createChallengeListItem({
              id: "task-6",
              slug: "no-languages",
              title: "No Languages",
              supportedLanguages: [],
            }),
          ],
        }),
      );
      vi.stubGlobal("fetch", fetchMock);
      serverMocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));

      const result = await getChallenges();

      expect(result.challenges).toHaveLength(4);
      expect(result.challenges[0]).toMatchObject({
        id: "task-1",
        difficulty: "Easy",
        kind: "sql",
        progress: "in-progress",
        supportedLanguages: ["javascript", "typescript"],
      });
      expect(result.challenges[1]).toMatchObject({
        id: "task-2",
        difficulty: "Hard",
        kind: "algorithmic",
        progress: "solved",
      });
      expect(result.challenges[2]).toMatchObject({
        id: "task-3",
        difficulty: "Medium",
        kind: "algorithmic",
        progress: "locked",
      });
      expect(result.challenges[3]).toMatchObject({
        id: "task-4",
        difficulty: "Medium",
        progress: "not-started",
      });

      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/tasks"), {
        method: "GET",
        headers: {
          cookie: "session=token",
        },
        cache: "no-store",
      });
    });
  });

  describe("getChallengeBySlug", () => {
    it("returns null when slug is blank", async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallengeBySlug("   ")).resolves.toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([401, 403, 404])("returns null for status %s", async (status) => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallengeBySlug("two-sum")).resolves.toBeNull();
    });

    it("throws for non-ok status", async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallengeBySlug("two-sum")).rejects.toThrow(
        "Failed to fetch challenge",
      );
    });

    it("returns null when response body is malformed", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response("broken", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallengeBySlug("two-sum")).resolves.toBeNull();
    });

    it("returns null when challenge has no supported languages", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          task: createChallengeTaskPayload({
            supportedLanguages: [],
          }),
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallengeBySlug("two-sum")).resolves.toBeNull();
    });

    it("returns null when supportedLanguages is not an array", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          task: createChallengeTaskPayload({
            supportedLanguages: "javascript",
          }),
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallengeBySlug("two-sum")).resolves.toBeNull();
    });

    it("returns null when challenge payload misses required identity fields", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          task: {
            id: "task-1",
          },
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      await expect(getChallengeBySlug("two-sum")).resolves.toBeNull();
    });

    it("returns parsed challenge and forwards request with encoded slug", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          task: createChallengeTaskPayload(),
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const result = await getChallengeBySlug(" two sum ");

      expect(result).toMatchObject({
        id: "task-1",
        taskId: "task-1",
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "Hard",
        kind: "sql",
        progress: "solved",
        supportedLanguages: ["javascript", "typescript"],
        languageVersions: {
          javascript: "Node.js 22",
          typescript: "TypeScript 5",
        },
        starterCodeByLanguage: {
          javascript: "function solve() {}",
          typescript: "function solve(): void {}",
        },
        description: ["Given an array"],
        constraints: ["2 <= nums.length <= 1e4"],
        notes: ["Use zero-based index"],
        testCases: [
          {
            name: "basic",
            input: "input",
            expectedOutput: "output",
            locked: true,
          },
          {
            name: "no-lock",
            input: "input",
            expectedOutput: "output",
          },
        ],
      });
      expect(result?.examples).toHaveLength(2);
      expect(result?.submissionHistory).toHaveLength(1);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/two%20sum"),
        {
          method: "GET",
          headers: undefined,
          cache: "no-store",
        },
      );
    });

    it("handles non-object languageVersions and omits empty notes/examples/test cases", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          task: createChallengeTaskPayload({
            notes: [],
            languageVersions: null,
            starterCodeByLanguage: null,
            examples: [null],
            testCases: [null],
          }),
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const result = await getChallengeBySlug("two-sum");

      expect(result).toMatchObject({
        id: "task-1",
        languageVersions: {},
        examples: [],
        testCases: [],
      });
      expect(result).not.toHaveProperty("notes");
    });

    it("handles non-array examples, testCases and submissionHistory as empty lists", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          task: createChallengeTaskPayload({
            examples: "invalid",
            testCases: "invalid",
            submissionHistory: "invalid",
          }),
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const result = await getChallengeBySlug("two-sum");

      expect(result).toMatchObject({
        id: "task-1",
        examples: [],
        testCases: [],
        submissionHistory: [],
      });
    });

    it("keeps starter code only when language source is a string", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({
          task: createChallengeTaskPayload({
            supportedLanguages: ["javascript", "typescript"],
            starterCodeByLanguage: {
              javascript: 123,
              typescript: "function solve(): void {}",
            },
          }),
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const result = await getChallengeBySlug("two-sum");

      expect(result).toMatchObject({
        id: "task-1",
        starterCodeByLanguage: {
          typescript: "function solve(): void {}",
        },
      });
    });
  });
});
