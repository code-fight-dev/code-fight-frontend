import { describe, expect, it } from "vitest";

import type { MatchReplayTimelineEvent, MatchSubmission } from "@/entities/match";
import { buildReplayPlaybackState } from "@/features/match-replay/model/playback";
import { createMatchReplayFixture } from "./fixtures";

function createSubmissionFixture(
  overrides: Partial<MatchSubmission> = {},
): MatchSubmission {
  return {
    id: "submission-1",
    matchId: "match-1",
    taskId: "task-1",
    userId: "viewer-1",
    language: "typescript",
    languageVersion: "TypeScript 5.8",
    sourceCode: "const answer = 1;",
    status: "finished",
    verdict: "accepted",
    passedTests: 2,
    totalTests: 2,
    score: 100,
    createdAt: "2026-05-24T10:00:10.000Z",
    updatedAt: "2026-05-24T10:00:10.000Z",
    testResults: [],
    ...overrides,
  };
}

describe("features/match-replay/model/playback fallback snapshots", () => {
  it("reuses submission source code when replay has no timeline events and snapshots", () => {
    const replay = createMatchReplayFixture({
      match: {
        startedAt: "2026-05-24T10:00:00.000Z",
      },
      timeline: {
        durationMs: 40_000,
        events: [],
        snapshots: [],
        submissions: [
          createSubmissionFixture({
            id: "submission-1",
            language: "typescript",
            sourceCode: "const answer = 1;",
            createdAt: "2026-05-24T10:00:10.000Z",
            updatedAt: "2026-05-24T10:00:10.000Z",
          }),
          createSubmissionFixture({
            id: "submission-2",
            language: "python",
            sourceCode: "answer = 2",
            createdAt: "2026-05-24T10:00:30.000Z",
            updatedAt: "2026-05-24T10:00:30.000Z",
          }),
        ],
      },
    });

    const playback = buildReplayPlaybackState(replay, "viewer-1", null);
    expect(playback.resolveAtTime(0).sourceCode).toBe("");
    expect(playback.resolveAtTime(10_000).sourceCode).toBe("const answer = 1;");
    expect(playback.resolveAtTime(30_000).sourceCode).toBe("answer = 2");
    expect(playback.resolveAtTime(30_000).language).toBe("python");
  });

  it("uses fallback snapshots even when timeline has events but no snapshots", () => {
    const events: MatchReplayTimelineEvent[] = [
      {
        userId: "viewer-1",
        seq: 1,
        tMs: 5_000,
        type: "insert",
        payload: {
          rangeOffset: 0,
          rangeLength: 0,
          text: "draft ",
        },
      },
    ];

    const replay = createMatchReplayFixture({
      match: {
        startedAt: "2026-05-24T10:00:00.000Z",
      },
      timeline: {
        durationMs: 20_000,
        events,
        snapshots: [],
        submissions: [
          createSubmissionFixture({
            id: "submission-1",
            sourceCode: "final answer",
            createdAt: "2026-05-24T10:00:10.000Z",
            updatedAt: "2026-05-24T10:00:10.000Z",
          }),
        ],
      },
    });

    const playback = buildReplayPlaybackState(replay, "viewer-1", null);
    expect(playback.resolveAtTime(6_000).sourceCode).toBe("draft ");
    expect(playback.resolveAtTime(10_000).sourceCode).toBe("final answer");
  });

  it("ignores submissions from other players in fallback snapshots", () => {
    const replay = createMatchReplayFixture({
      match: {
        startedAt: "2026-05-24T10:00:00.000Z",
      },
      timeline: {
        durationMs: 40_000,
        events: [],
        snapshots: [],
        submissions: [
          createSubmissionFixture({
            id: "submission-1",
            userId: "viewer-1",
            sourceCode: "viewer one code",
            createdAt: "2026-05-24T10:00:10.000Z",
            updatedAt: "2026-05-24T10:00:10.000Z",
          }),
          createSubmissionFixture({
            id: "submission-other",
            userId: "viewer-2",
            sourceCode: "should not be visible",
            createdAt: "2026-05-24T10:00:20.000Z",
            updatedAt: "2026-05-24T10:00:20.000Z",
          }),
        ],
      },
    });

    const playback = buildReplayPlaybackState(replay, "viewer-1", null);
    expect(playback.resolveAtTime(10_000).sourceCode).toBe("viewer one code");
    expect(playback.resolveAtTime(20_000).sourceCode).toBe("viewer one code");
  });
});
