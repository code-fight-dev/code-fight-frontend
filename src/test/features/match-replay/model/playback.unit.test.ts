import { describe, expect, it } from "vitest";

import type { MatchReplayTimelineEvent, MatchSubmission } from "@/entities/match";
import {
  buildSubmissionCheckpoints,
  resolveMatchStartTimestamp,
  resolveSubmissionTimestamp,
} from "@/features/match-replay/model/playback/checkpoints";
import { resolveViewStateAtTime } from "@/features/match-replay/model/playback/resolver";
import { parseTimestamp } from "@/features/match-replay/model/playback/time";
import {
  filterPlayerEvents,
  filterPlayerSnapshots,
} from "@/features/match-replay/model/playback/timeline";
import { buildTrack } from "@/features/match-replay/model/playback/track";
import type { ReplayTrack } from "@/features/match-replay/model/playback/types";
import { createChallengeFixture } from "@/test/fixtures/challenge";
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

function createTrackFixture(overrides: Partial<ReplayTrack> = {}): ReplayTrack {
  return {
    initialLanguage: "typescript",
    initialSourceCode: "abc",
    durationMs: 40,
    events: [],
    snapshots: [],
    checkpoints: [],
    ...overrides,
  };
}

describe("features/match-replay/model/playback utilities", () => {
  it("parses timestamps and returns null for empty or invalid values", () => {
    expect(parseTimestamp(undefined)).toBeNull();
    expect(parseTimestamp("not-a-date")).toBeNull();
    expect(parseTimestamp("2026-05-24T10:00:00.000Z")).toBe(
      Date.parse("2026-05-24T10:00:00.000Z"),
    );
  });

  it("resolves submission timestamps with createdAt, updatedAt and fallback", () => {
    const startTimestamp = Date.parse("2026-05-24T10:00:00.000Z");

    expect(
      resolveSubmissionTimestamp(
        createSubmissionFixture({
          createdAt: "2026-05-24T10:00:03.000Z",
        }),
        startTimestamp,
      ),
    ).toBe(3000);

    expect(
      resolveSubmissionTimestamp(
        createSubmissionFixture({
          createdAt: "bad-created-at",
          updatedAt: "2026-05-24T10:00:04.000Z",
        }),
        startTimestamp,
      ),
    ).toBe(4000);

    expect(
      resolveSubmissionTimestamp(
        createSubmissionFixture({
          createdAt: "bad-created-at",
          updatedAt: "bad-updated-at",
        }),
        startTimestamp,
      ),
    ).toBe(0);

    expect(
      resolveSubmissionTimestamp(
        createSubmissionFixture({
          createdAt: "2026-05-24T09:59:59.000Z",
        }),
        startTimestamp,
      ),
    ).toBe(0);
  });

  it("resolves match start timestamp from startedAt, createdAt and fallback zero", () => {
    expect(
      resolveMatchStartTimestamp(
        createMatchReplayFixture({
          match: {
            startedAt: "2026-05-24T10:00:05.000Z",
            createdAt: "2026-05-24T09:59:00.000Z",
          },
        }),
      ),
    ).toBe(Date.parse("2026-05-24T10:00:05.000Z"));

    expect(
      resolveMatchStartTimestamp(
        createMatchReplayFixture({
          match: {
            startedAt: "bad-started-at",
            createdAt: "2026-05-24T09:59:00.000Z",
          },
        }),
      ),
    ).toBe(Date.parse("2026-05-24T09:59:00.000Z"));

    expect(
      resolveMatchStartTimestamp(
        createMatchReplayFixture({
          match: {
            startedAt: "bad-started-at",
            createdAt: "bad-created-at",
          },
        }),
      ),
    ).toBe(0);
  });

  it("builds checkpoints with a start marker and ordered submission labels", () => {
    const checkpoints = buildSubmissionCheckpoints(
      [
        createSubmissionFixture({
          id: "submission-1",
          verdict: "accepted",
          status: "finished",
          score: 100,
          createdAt: "2026-05-24T10:00:10.000Z",
        }),
        createSubmissionFixture({
          id: "submission-2",
          verdict: "wrong_answer",
          status: "failed",
          score: 20,
          createdAt: "2026-05-24T10:00:20.000Z",
        }),
      ],
      Date.parse("2026-05-24T10:00:00.000Z"),
    );

    expect(checkpoints).toEqual([
      {
        id: "start",
        label: "Start",
        tMs: 0,
      },
      {
        id: "submission-1",
        label: "Submit #1",
        tMs: 10000,
        submissionId: "submission-1",
        verdict: "accepted",
        status: "finished",
        score: 100,
        createdAt: "2026-05-24T10:00:10.000Z",
      },
      {
        id: "submission-2",
        label: "Submit #2",
        tMs: 20000,
        submissionId: "submission-2",
        verdict: "wrong_answer",
        status: "failed",
        score: 20,
        createdAt: "2026-05-24T10:00:20.000Z",
      },
    ]);
  });
});

describe("features/match-replay/model/playback timeline", () => {
  it("filters player snapshots and sorts by timeline point", () => {
    const replay = createMatchReplayFixture({
      timeline: {
        snapshots: [
          {
            userId: "viewer-2",
            seq: 1,
            tMs: 5,
            language: "python",
            sourceCode: "other",
          },
          {
            userId: "viewer-1",
            seq: 5,
            tMs: 20,
            language: "go",
            sourceCode: "go-code",
          },
          {
            userId: "viewer-1",
            seq: 3,
            tMs: 20,
            language: "typescript",
            sourceCode: "ts-code",
          },
          {
            userId: "viewer-1",
            seq: 2,
            tMs: 10,
            language: "python",
            sourceCode: "py-code",
          },
        ],
      },
    });

    expect(filterPlayerSnapshots(replay, "viewer-1")).toEqual([
      {
        seq: 2,
        tMs: 10,
        language: "python",
        sourceCode: "py-code",
      },
      {
        seq: 3,
        tMs: 20,
        language: "typescript",
        sourceCode: "ts-code",
      },
      {
        seq: 5,
        tMs: 20,
        language: "go",
        sourceCode: "go-code",
      },
    ]);
  });

  it("filters and parses player events, skipping unsupported meta events", () => {
    const events: MatchReplayTimelineEvent[] = [
      {
        userId: "viewer-1",
        seq: 3,
        tMs: 12,
        type: "replace",
        payload: {
          rangeOffset: 1,
          rangeLength: 1,
          text: "Z",
        },
      },
      {
        userId: "viewer-2",
        seq: 1,
        tMs: 1,
        type: "insert",
        payload: {
          rangeOffset: 0,
          rangeLength: 0,
          text: "x",
        },
      },
      {
        userId: "viewer-1",
        seq: 1,
        tMs: 12,
        type: "insert",
        payload: {
          rangeOffset: 0,
          text: "A",
        },
      },
      {
        userId: "viewer-1",
        seq: 9,
        tMs: 5,
        type: "cursor",
        payload: {
          line: 4,
          column: 2,
        },
      },
      {
        userId: "viewer-1",
        seq: 2,
        tMs: 12,
        type: "language_switch",
        payload: {
          language: " python ",
        },
      },
    ];

    const replay = createMatchReplayFixture({
      timeline: {
        events,
      },
    });

    expect(filterPlayerEvents(replay, "viewer-1")).toEqual([
      {
        userId: "viewer-1",
        seq: 1,
        tMs: 12,
        type: "insert",
        payload: {
          rangeOffset: 0,
          rangeLength: 0,
          text: "A",
        },
      },
      {
        userId: "viewer-1",
        seq: 2,
        tMs: 12,
        type: "language_switch",
        payload: {
          language: "python",
        },
      },
      {
        userId: "viewer-1",
        seq: 3,
        tMs: 12,
        type: "replace",
        payload: {
          rangeOffset: 1,
          rangeLength: 1,
          text: "Z",
        },
      },
    ]);
  });

  it("throws when replay has invalid payload for a supported event type", () => {
    const replay = createMatchReplayFixture({
      timeline: {
        events: [
          {
            userId: "viewer-1",
            seq: 7,
            tMs: 22,
            type: "insert",
            payload: {
              rangeOffset: -1,
              rangeLength: 0,
              text: "bad",
            },
          },
        ],
      },
    });

    expect(() => filterPlayerEvents(replay, "viewer-1")).toThrow(
      "Replay contains invalid timeline event (seq=7, type=insert).",
    );
  });
});

describe("features/match-replay/model/playback track", () => {
  it("uses timeline snapshots as initial source and does not build fallback snapshots", () => {
    const challenge = createChallengeFixture({
      starterCodeByLanguage: {
        python: "def solve():\n    return 42",
      },
    });
    const replay = createMatchReplayFixture({
      timeline: {
        snapshots: [
          {
            userId: "viewer-1",
            seq: 2,
            tMs: 20,
            language: "python",
            sourceCode: "print(1)",
          },
          {
            userId: "viewer-1",
            seq: 1,
            tMs: 10,
            language: "python",
            sourceCode: "print(0)",
          },
        ],
      },
    });

    const track = buildTrack(replay, "viewer-1", challenge);

    expect(track.initialLanguage).toBe("python");
    expect(track.initialSourceCode).toBe("def solve():\n    return 42");
    expect(track.snapshots.map((snapshot) => snapshot.seq)).toEqual([1, 2]);
  });

  it("builds fallback snapshots from submissions and keeps fallback language for empty submission language", () => {
    const challenge = createChallengeFixture({
      starterCodeByLanguage: {},
    });
    const replay = createMatchReplayFixture({
      match: {
        startedAt: "2026-05-24T10:00:00.000Z",
      },
      timeline: {
        snapshots: [],
        submissions: [
          createSubmissionFixture({
            id: "submission-2",
            language: "python",
            sourceCode: "second",
            createdAt: "2026-05-24T10:00:20.000Z",
          }),
          createSubmissionFixture({
            id: "submission-1",
            language: "",
            sourceCode: "first",
            createdAt: "2026-05-24T10:00:10.000Z",
          }),
        ],
      },
    });

    const track = buildTrack(replay, "viewer-1", challenge);

    expect(track.initialLanguage).toBe("python");
    expect(track.initialSourceCode).toBe("");
    expect(track.snapshots).toEqual([
      {
        seq: 1_000_000_000,
        tMs: 10000,
        language: "python",
        sourceCode: "first",
      },
      {
        seq: 1_000_000_001,
        tMs: 20000,
        language: "python",
        sourceCode: "second",
      },
    ]);
    expect(track.checkpoints.map((checkpoint) => checkpoint.id)).toEqual([
      "start",
      "submission-1",
      "submission-2",
    ]);
  });

  it("resolves initial language from challenge defaults when player timeline is empty", () => {
    const challenge = createChallengeFixture({
      supportedLanguages: ["go"],
      starterCodeByLanguage: {
        go: "package main\n\nfunc solve() {}",
      },
    });
    const replay = createMatchReplayFixture({
      timeline: {
        snapshots: [],
        submissions: [],
      },
    });

    const track = buildTrack(replay, "viewer-404", challenge);

    expect(track.initialLanguage).toBe("go");
    expect(track.initialSourceCode).toBe("package main\n\nfunc solve() {}");
  });

  it("falls back to typescript and empty source when no hints exist", () => {
    const replay = createMatchReplayFixture({
      timeline: {
        snapshots: [],
        submissions: [],
      },
    });

    const track = buildTrack(replay, "viewer-404", null);

    expect(track.initialLanguage).toBe("typescript");
    expect(track.initialSourceCode).toBe("");
  });
});

describe("features/match-replay/model/playback resolver", () => {
  it("clamps replay time and returns safe defaults when track has no snapshots or checkpoints", () => {
    const track = createTrackFixture({
      durationMs: 40,
      initialLanguage: "typescript",
      initialSourceCode: "seed",
      checkpoints: [],
    });

    expect(resolveViewStateAtTime(track, -100)).toEqual({
      timeMs: 0,
      language: "typescript",
      sourceCode: "seed",
      checkpointIndex: 0,
      currentCheckpoint: undefined,
    });

    expect(resolveViewStateAtTime(track, 999).timeMs).toBe(40);
  });

  it("starts from latest snapshot and applies events after snapshot timeline point", () => {
    const track = createTrackFixture({
      durationMs: 40,
      initialLanguage: "typescript",
      initialSourceCode: "should-not-be-used",
      snapshots: [
        {
          seq: 1,
          tMs: 10,
          language: "python",
          sourceCode: "abc",
        },
      ],
      events: [
        {
          userId: "viewer-1",
          seq: 1,
          tMs: 10,
          type: "insert",
          payload: {
            rangeOffset: 0,
            rangeLength: 0,
            text: "X",
          },
        },
        {
          userId: "viewer-1",
          seq: 2,
          tMs: 10,
          type: "replace",
          payload: {
            rangeOffset: 1,
            rangeLength: 1,
            text: "Z",
          },
        },
        {
          userId: "viewer-1",
          seq: 3,
          tMs: 20,
          type: "language_switch",
          payload: {
            language: "go",
          },
        },
        {
          userId: "viewer-1",
          seq: 4,
          tMs: 45,
          type: "insert",
          payload: {
            rangeOffset: 3,
            rangeLength: 0,
            text: "!",
          },
        },
      ],
      checkpoints: [
        {
          id: "start",
          label: "Start",
          tMs: 0,
        },
        {
          id: "cp-1",
          label: "Submit #1",
          tMs: 15,
        },
        {
          id: "cp-2",
          label: "Submit #2",
          tMs: 35,
        },
      ],
    });

    expect(resolveViewStateAtTime(track, 100)).toEqual({
      timeMs: 40,
      language: "go",
      sourceCode: "aZc",
      checkpointIndex: 2,
      currentCheckpoint: {
        id: "cp-2",
        label: "Submit #2",
        tMs: 35,
      },
    });
  });

  it("throws on invalid replay mutation range", () => {
    const track = createTrackFixture({
      events: [
        {
          userId: "viewer-1",
          seq: 9,
          tMs: 5,
          type: "insert",
          payload: {
            rangeOffset: 999,
            rangeLength: 0,
            text: "bad",
          },
        },
      ],
      checkpoints: [
        {
          id: "start",
          label: "Start",
          tMs: 0,
        },
      ],
    });

    expect(() => resolveViewStateAtTime(track, 10)).toThrow(
      "Replay mutation range is invalid at seq=9, type=insert.",
    );
  });
});
