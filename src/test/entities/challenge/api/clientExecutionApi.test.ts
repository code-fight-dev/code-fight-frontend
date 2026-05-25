import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createTaskRun,
  createTaskSubmission,
  getCodeRun,
  getSubmission,
} from "@/entities/challenge/client";

function createSubmissionPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "submission-1",
    task_id: "task-1",
    user_id: "user-1",
    language: "typescript",
    language_version: "TypeScript 5",
    source_code: "console.log('hello')",
    status: "queued",
    passed_tests: 0,
    total_tests: 3,
    score: 0,
    created_at: "2026-05-24T12:00:00.000Z",
    updated_at: "2026-05-24T12:01:00.000Z",
    ...overrides,
  };
}

function createCodeRunPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "run-1",
    task_id: "task-1",
    user_id: "user-1",
    language: "typescript",
    language_version: "TypeScript 5",
    status: "queued",
    passed_tests: 0,
    total_tests: 3,
    score: 0,
    created_at: "2026-05-24T12:00:00.000Z",
    updated_at: "2026-05-24T12:01:00.000Z",
    ...overrides,
  };
}

describe("challenge client api: execution", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([
    [
      "createTaskSubmission",
      () =>
        createTaskSubmission("   ", {
          language: "typescript",
          languageVersion: "5.0",
          sourceCode: "code",
        }),
    ],
    ["getSubmission", () => getSubmission("   ")],
    [
      "createTaskRun",
      () =>
        createTaskRun("   ", {
          language: "typescript",
          languageVersion: "5.0",
          sourceCode: "code",
        }),
    ],
    ["getCodeRun", () => getCodeRun("   ")],
  ])("throws on empty id for %s", async (_name, run) => {
    await expect(run()).rejects.toThrow(/is required/);
  });

  it("creates task submission and sends expected payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createSubmissionPayload()), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const signal = new AbortController().signal;
    const result = await createTaskSubmission(
      " task-1 ",
      {
        language: "typescript",
        languageVersion: "TypeScript 5.0",
        sourceCode: "console.log('hello')",
      },
      signal,
    );

    expect(result).toMatchObject({
      id: "submission-1",
      taskId: "task-1",
      language: "typescript",
      languageVersion: "TypeScript 5",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/tasks/task-1/submissions");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.signal).toBe(signal);
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      language: "typescript",
      language_version: "TypeScript 5.0",
      source_code: "console.log('hello')",
    });
  });

  it("throws backend error message when submission request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Language is not supported" }), {
        status: 422,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createTaskSubmission("task-1", {
        language: "typescript",
        languageVersion: "TypeScript 5.0",
        sourceCode: "code",
      }),
    ).rejects.toThrow("Language is not supported");
  });

  it("falls back to default submission error when response body is malformed", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("broken", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createTaskSubmission("task-1", {
        language: "typescript",
        languageVersion: "TypeScript 5.0",
        sourceCode: "code",
      }),
    ).rejects.toThrow("Failed to submit solution");
  });

  it("falls back to default submission error when error field is blank", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "   " }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSubmission("submission-1")).rejects.toThrow(
      "Failed to fetch submission",
    );
  });

  it("throws when submission response shape is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "broken" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createTaskSubmission("task-1", {
        language: "typescript",
        languageVersion: "TypeScript 5.0",
        sourceCode: "code",
      }),
    ).rejects.toThrow("Invalid submission response");
  });

  it("fetches submission by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createSubmissionPayload()), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getSubmission(" submission-1 ");
    expect(result).toMatchObject({
      id: "submission-1",
      taskId: "task-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/submissions/submission-1"),
      {
        method: "GET",
        credentials: "include",
        signal: undefined,
      },
    );
  });

  it("creates code run with custom test input when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createCodeRunPayload()), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createTaskRun("task-1", {
      language: "typescript",
      languageVersion: "TypeScript 5.0",
      sourceCode: "console.log('run')",
      customTestInput: "1 2 3",
    });

    expect(result).toMatchObject({
      id: "run-1",
      taskId: "task-1",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      language: "typescript",
      language_version: "TypeScript 5.0",
      source_code: "console.log('run')",
      custom_test: {
        input: "1 2 3",
      },
    });
  });

  it("omits custom test payload when custom input is blank", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createCodeRunPayload()), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await createTaskRun("task-1", {
      language: "typescript",
      languageVersion: "TypeScript 5.0",
      sourceCode: "console.log('run')",
      customTestInput: "   ",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      language: "typescript",
      language_version: "TypeScript 5.0",
      source_code: "console.log('run')",
    });
  });

  it("throws when code run response shape is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "broken" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createTaskRun("task-1", {
        language: "typescript",
        languageVersion: "TypeScript 5.0",
        sourceCode: "code",
      }),
    ).rejects.toThrow("Invalid code run response");
  });

  it("fetches code run by id and uses fallback error for malformed body", async () => {
    const okResponse = new Response(JSON.stringify(createCodeRunPayload()), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
    const failedResponse = new Response("broken", { status: 500 });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse)
      .mockResolvedValueOnce(failedResponse);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getCodeRun(" run-1 ");
    expect(result).toMatchObject({
      id: "run-1",
      taskId: "task-1",
    });

    await expect(getCodeRun("run-1")).rejects.toThrow("Failed to fetch code run");
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/api/code-runs/run-1");
  });
});
