import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createMatchSubmission,
  getCurrentMatch,
  getMatch,
  getMatchReplay,
  joinQueue,
  leaveQueue,
  startMatch,
  surrenderMatch,
} from "@/entities/match/client";

function createSnakeMatch(overrides: Record<string, unknown> = {}) {
  return {
    id: "match-1",
    rating_mode: "global",
    task_mode: "NORMAL",
    task_id: "task-1",
    task_difficulty_snapshot: "MEDIUM",
    player1_id: "player-1",
    player2_id: "player-2",
    player1_ready: true,
    player2_ready: false,
    winner_id: "player-1",
    status: "running",
    judge_status: "ready",
    result_type: "player1_win",
    winning_reason: "accepted_faster",
    is_rated: true,
    rating_applied: false,
    player1_rating_delta: 12,
    player2_rating_delta: -8,
    player1_score: 120,
    player2_score: 90,
    player1_attempts: 2,
    player2_attempts: 3,
    player1_solved: true,
    player2_solved: false,
    player1_solved_at: "2026-05-24T10:05:00.000Z",
    player2_solved_at: "2026-05-24T10:08:00.000Z",
    started_at: "2026-05-24T10:00:00.000Z",
    finished_at: "2026-05-24T10:10:00.000Z",
    expires_at: "2026-05-24T10:30:00.000Z",
    created_at: "2026-05-24T09:59:00.000Z",
    updated_at: "2026-05-24T10:11:00.000Z",
    ...overrides,
  };
}

function createSnakeSubmission(overrides: Record<string, unknown> = {}) {
  return {
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
      },
    ],
    ...overrides,
  };
}

function createReplayPayload(overrides: Record<string, unknown> = {}) {
  return {
    permissions: {
      can_view_replay: true,
      can_view_source_code: false,
    },
    match: createSnakeMatch(),
    players: [
      {
        id: "player-1",
        username: "alice",
        display_name: "Alice",
        avatar_url: "https://example.com/alice.png",
      },
      {
        id: "player-2",
        username: "bob",
        display_name: "Bob",
        avatar_url: "https://example.com/bob.png",
      },
    ],
    timeline: {
      version: 1,
      duration_ms: 1200,
      events: [
        {
          user_id: "player-1",
          seq: 1,
          t_ms: 250,
          type: "code.change",
          payload: {
            value: "console.log('hello')",
          },
        },
      ],
      snapshots: [
        {
          user_id: "player-1",
          seq: 1,
          t_ms: 0,
          language: "typescript",
          source_code: "console.log('hello')",
        },
      ],
      submissions: [createSnakeSubmission()],
    },
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

describe("match client api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("joins queue with default rating mode and parses response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: "queued" }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await joinQueue({
      taskMode: "normal",
      isRated: true,
    });

    expect(result).toEqual({
      status: "queued",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/matches/queue");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(JSON.parse(String(init.body))).toEqual({
      rating_mode: "global",
      task_mode: "normal",
      is_rated: true,
    });
  });

  it("throws backend queue error message", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          error: "Queue unavailable",
        },
        503,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      joinQueue({
        taskMode: "hard",
        isRated: false,
        ratingMode: "global",
      }),
    ).rejects.toThrow("Queue unavailable");
  });

  it("falls back to default queue error when error field is blank", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          error: "   ",
        },
        400,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      joinQueue({
        taskMode: "normal",
        isRated: true,
      }),
    ).rejects.toThrow("Failed to join matchmaking queue");
  });

  it("throws invalid queue response when parser fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: "unknown" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      joinQueue({
        taskMode: "normal",
        isRated: true,
      }),
    ).rejects.toThrow("Invalid queue response");
  });

  it("leaves queue on 204 and throws for unexpected success status", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(leaveQueue()).resolves.toBeUndefined();
    await expect(leaveQueue()).rejects.toThrow(
      "Failed to leave matchmaking queue: unexpected response status 200, expected 204",
    );
  });

  it("throws fallback leave queue error on non-object failure body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("broken", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(leaveQueue()).rejects.toThrow("Failed to leave matchmaking queue");
  });

  it("gets current match and forwards abort signal", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ match: null }));
    vi.stubGlobal("fetch", fetchMock);

    const signal = new AbortController().signal;
    const result = await getCurrentMatch(signal);

    expect(result).toEqual({
      match: null,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/matches/current"),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal,
      },
    );
  });

  it("throws invalid current match response for malformed payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ match: { id: "" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentMatch()).rejects.toThrow("Invalid current match response");
  });

  it("gets match by id and validates required id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(createSnakeMatch()));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getMatch("   ")).rejects.toThrow("Match id is required");

    const signal = new AbortController().signal;
    const match = await getMatch(" match 1 ", signal);

    expect(match).toMatchObject({
      id: "match-1",
      taskMode: "normal",
      status: "running",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/matches/match%201"),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal,
      },
    );
  });

  it("starts match and throws backend message on failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createSnakeMatch()))
      .mockResolvedValueOnce(jsonResponse({ error: "Match already started" }, 409));
    vi.stubGlobal("fetch", fetchMock);

    const started = await startMatch("match-1");
    expect(started).toMatchObject({
      id: "match-1",
    });

    await expect(startMatch("match-1")).rejects.toThrow("Match already started");
    await expect(startMatch("   ")).rejects.toThrow("Match id is required");
  });

  it("surrenders match and handles non-204 responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ error: "Cannot surrender now" }, 400))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(surrenderMatch("match-1")).resolves.toBeUndefined();
    await expect(surrenderMatch("match-1")).rejects.toThrow("Cannot surrender now");
    await expect(surrenderMatch("match-1")).rejects.toThrow(
      "Failed to surrender match: unexpected response status 200, expected 204",
    );
  });

  it("creates match submission and maps payload fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(createSnakeSubmission()));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createMatchSubmission(" match-1 ", {
      language: "typescript",
      languageVersion: "5.8",
      sourceCode: "console.log('hello')",
    });

    expect(result).toMatchObject({
      id: "submission-1",
      matchId: "match-1",
      taskId: "task-1",
      languageVersion: "5.8",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/matches/match-1/submissions");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      language: "typescript",
      language_version: "5.8",
      source_code: "console.log('hello')",
    });
  });

  it("throws invalid submission response when parser returns null", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: "broken" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createMatchSubmission("match-1", {
        language: "typescript",
        languageVersion: "5.8",
        sourceCode: "code",
      }),
    ).rejects.toThrow("Invalid submission response");
  });

  it("gets match replay and handles malformed failure body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createReplayPayload()))
      .mockResolvedValueOnce(new Response("broken", { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ replay: "invalid" }));
    vi.stubGlobal("fetch", fetchMock);

    const replay = await getMatchReplay(" match-1 ");
    expect(replay).toMatchObject({
      match: {
        id: "match-1",
      },
      timeline: {
        version: 1,
      },
    });

    await expect(getMatchReplay("match-1")).rejects.toThrow(
      "Failed to fetch match replay",
    );
    await expect(getMatchReplay("match-1")).rejects.toThrow(
      "Invalid match replay response",
    );
    await expect(getMatchReplay("   ")).rejects.toThrow("Match id is required");
  });
});
