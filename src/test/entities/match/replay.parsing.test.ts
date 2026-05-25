import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  parseMatchFromSnakeCase,
  parseMatchReplayFromSnakeCase,
  parseMatchSubmissionFromSnakeCase,
} from "@/entities/match";
import {
  parsedMatch,
  parsedSubmission,
  validReplay,
  validTimeline,
  validTimelineSnapshot,
} from "./replay.test-helpers";

vi.mock("@/entities/match/model/parsers/match", () => ({
  parseMatchFromSnakeCase: vi.fn(),
}));

vi.mock("@/entities/match/model/parsers/submission", () => ({
  parseMatchSubmissionFromSnakeCase: vi.fn(),
}));

describe("parseMatchReplayFromSnakeCase parsing", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(parseMatchFromSnakeCase).mockReturnValue(
      parsedMatch as NonNullable<ReturnType<typeof parseMatchFromSnakeCase>>,
    );
    vi.mocked(parseMatchSubmissionFromSnakeCase).mockReturnValue(
      parsedSubmission as NonNullable<
        ReturnType<typeof parseMatchSubmissionFromSnakeCase>
      >,
    );
  });

  it("parses a valid replay from snake_case payload", () => {
    const rawReplay = validReplay();

    const result = parseMatchReplayFromSnakeCase(rawReplay);

    expect(parseMatchFromSnakeCase).toHaveBeenCalledTimes(1);
    expect(parseMatchFromSnakeCase).toHaveBeenCalledWith(rawReplay.match);

    expect(parseMatchSubmissionFromSnakeCase).toHaveBeenCalledTimes(1);
    expect(vi.mocked(parseMatchSubmissionFromSnakeCase).mock.calls[0]?.[0]).toStrictEqual(
      {
        id: "submission-1",
      },
    );

    expect(result).toStrictEqual({
      permissions: {
        canViewReplay: true,
        canViewSourceCode: false,
      },
      match: parsedMatch,
      players: [
        {
          id: "player-1",
          username: "lyosh",
          displayName: "Lyosh",
          avatarUrl: "https://example.com/avatar.png",
        },
        {
          id: "player-2",
          username: "opponent",
          displayName: "Opponent",
          avatarUrl: "",
        },
      ],
      timeline: {
        version: 1,
        durationMs: 1200,
        events: [
          {
            userId: "player-1",
            seq: 1,
            tMs: 250,
            type: "code.change",
            payload: {
              value: "console.log('hello')",
            },
          },
        ],
        snapshots: [
          {
            userId: "player-1",
            seq: 1,
            tMs: 0,
            language: "typescript",
            sourceCode: "console.log('hello')",
          },
        ],
        submissions: [parsedSubmission],
      },
    });
  });

  it("supports camelCase aliases in replay payload", () => {
    const result = parseMatchReplayFromSnakeCase(
      validReplay({
        permissions: {
          canViewReplay: true,
          canViewSourceCode: true,
        },
        players: [
          {
            id: "player-1",
            username: "lyosh",
            displayName: "Lyosh",
            avatarUrl: "https://example.com/avatar.png",
          },
        ],
        timeline: {
          version: 2,
          durationMs: 900,
          events: [
            {
              userId: "player-1",
              seq: 2,
              tMs: 400,
              type: "cursor.move",
              payload: {
                line: 10,
              },
            },
          ],
          snapshots: [
            {
              userId: "player-1",
              seq: 1,
              tMs: 0,
              language: "javascript",
              sourceCode: "console.log('js')",
            },
          ],
        },
      }),
    );

    expect(result).toStrictEqual({
      permissions: {
        canViewReplay: true,
        canViewSourceCode: true,
      },
      match: parsedMatch,
      players: [
        {
          id: "player-1",
          username: "lyosh",
          displayName: "Lyosh",
          avatarUrl: "https://example.com/avatar.png",
        },
      ],
      timeline: {
        version: 2,
        durationMs: 900,
        events: [
          {
            userId: "player-1",
            seq: 2,
            tMs: 400,
            type: "cursor.move",
            payload: {
              line: 10,
            },
          },
        ],
        snapshots: [
          {
            userId: "player-1",
            seq: 1,
            tMs: 0,
            language: "javascript",
            sourceCode: "console.log('js')",
          },
        ],
        submissions: [],
      },
    });
  });

  it("allows empty source code in timeline snapshot", () => {
    const result = parseMatchReplayFromSnakeCase(
      validReplay({
        timeline: validTimeline({
          snapshots: [
            {
              ...validTimelineSnapshot(),
              source_code: "",
            },
          ],
        }),
      }),
    );

    expect(result?.timeline.snapshots[0]).toStrictEqual({
      userId: "player-1",
      seq: 1,
      tMs: 0,
      language: "typescript",
      sourceCode: "",
    });
  });

  it("uses empty submissions list when submissions field is missing", () => {
    const result = parseMatchReplayFromSnakeCase(
      validReplay({
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
          snapshots: [validTimelineSnapshot()],
        },
      }),
    );

    expect(result?.timeline.submissions).toStrictEqual([]);
    expect(parseMatchSubmissionFromSnakeCase).not.toHaveBeenCalled();
  });
});
