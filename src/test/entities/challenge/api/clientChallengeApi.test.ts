import { afterEach, describe, expect, it, vi } from "vitest";

import { getChallengeByTaskId } from "@/entities/challenge/client";

function createTaskPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "task-1",
    taskId: "task-1",
    slug: "two-sum",
    title: "Two Sum",
    supportedLanguages: ["javascript"],
    ...overrides,
  };
}

describe("challenge client api: getChallengeByTaskId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("throws when task id is empty", async () => {
    await expect(getChallengeByTaskId("   ")).rejects.toThrow("Task id is required");
  });

  it("returns null when backend responds with 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getChallengeByTaskId("task-1")).resolves.toBeNull();
  });

  it("throws backend error message when request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Challenge unavailable" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getChallengeByTaskId("task-1")).rejects.toThrow("Challenge unavailable");
  });

  it("falls back to default error when response body is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("broken", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getChallengeByTaskId("task-1")).rejects.toThrow(
      "Failed to fetch challenge",
    );
  });

  it("returns null when challenge payload is invalid or has no supported languages", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ task: { id: "task-1" } }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            task: createTaskPayload({
              supportedLanguages: [],
            }),
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getChallengeByTaskId("task-1")).resolves.toBeNull();
    await expect(getChallengeByTaskId("task-1")).resolves.toBeNull();
  });

  it("returns parsed challenge and forwards request options", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ task: createTaskPayload() }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const signal = new AbortController().signal;
    const result = await getChallengeByTaskId("  task-1  ", signal);

    expect(result).toMatchObject({
      id: "task-1",
      slug: "two-sum",
      title: "Two Sum",
      supportedLanguages: ["javascript"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/tasks/id/task-1"),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal,
      },
    );
  });
});
