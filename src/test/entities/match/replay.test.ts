import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  parseMatchFromSnakeCase,
  parseMatchReplayFromSnakeCase,
  parseMatchSubmissionFromSnakeCase,
} from "@/entities/match";

vi.mock("@/entities/match/model/parsers/match", () => ({
  parseMatchFromSnakeCase: vi.fn(),
}));

vi.mock("@/entities/match/model/parsers/submission", () => ({
  parseMatchSubmissionFromSnakeCase: vi.fn(),
}));

const parsedMatch = {
  id: "match-1",
} as unknown as NonNullable<ReturnType<typeof parseMatchFromSnakeCase>>;

const parsedSubmission = {
  id: "submission-1",
} as unknown as NonNullable<ReturnType<typeof parseMatchSubmissionFromSnakeCase>>;

const validTimelineEvent = () => ({
  user_id: "player-1",
  seq: 1,
  t_ms: 250,
  type: "code.change",
  payload: {
    value: "console.log('hello')",
  },
});

const validTimelineSnapshot = () => ({
  user_id: "player-1",
  seq: 1,
  t_ms: 0,
  language: "typescript",
  source_code: "console.log('hello')",
});

const validTimeline = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  duration_ms: 1200,
  events: [validTimelineEvent()],
  snapshots: [validTimelineSnapshot()],
  submissions: [
    {
      id: "submission-1",
    },
  ],
  ...overrides,
});

const validReplay = (overrides: Record<string, unknown> = {}) => ({
  permissions: {
    can_view_replay: true,
    can_view_source_code: false,
  },
  match: {
    id: "match-1",
  },
  players: [
    {
      id: "player-1",
      username: "lyosh",
      display_name: "Lyosh",
      avatar_url: "https://example.com/avatar.png",
    },
    {
      id: "player-2",
      username: "opponent",
      display_name: "Opponent",
      avatar_url: "",
    },
  ],
  timeline: validTimeline(),
  ...overrides,
});

describe("parseMatchReplayFromSnakeCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(parseMatchFromSnakeCase).mockReturnValue(parsedMatch);
    vi.mocked(parseMatchSubmissionFromSnakeCase).mockReturnValue(parsedSubmission);
  });

  it("returns null when value is not an object", () => {
    expect(parseMatchReplayFromSnakeCase(null)).toBeNull();
    expect(parseMatchReplayFromSnakeCase(undefined)).toBeNull();
    expect(parseMatchReplayFromSnakeCase("replay")).toBeNull();
    expect(parseMatchReplayFromSnakeCase(123)).toBeNull();
    expect(parseMatchReplayFromSnakeCase([])).toBeNull();
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

  it("returns null when permissions are invalid", () => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          permissions: null,
        }),
      ),
    ).toBeNull();

    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          permissions: {
            can_view_replay: "not-boolean",
            can_view_source_code: false,
          },
        }),
      ),
    ).toBeNull();

    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          permissions: {
            can_view_replay: true,
            can_view_source_code: "not-boolean",
          },
        }),
      ),
    ).toBeNull();
  });

  it("returns null when match parser fails", () => {
    vi.mocked(parseMatchFromSnakeCase).mockReturnValue(null);

    expect(parseMatchReplayFromSnakeCase(validReplay())).toBeNull();
  });

  it("returns null when players are missing or not an array", () => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          players: null,
        }),
      ),
    ).toBeNull();

    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          players: {},
        }),
      ),
    ).toBeNull();
  });

  it("returns null when a player item is not an object", () => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          players: [null],
        }),
      ),
    ).toBeNull();

    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          players: ["player"],
        }),
      ),
    ).toBeNull();
  });

  it.each([
    ["id", ""],
    ["username", ""],
    ["display_name", ""],
  ])("returns null when player field %s is invalid", (field, value) => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          players: [
            {
              id: "player-1",
              username: "lyosh",
              display_name: "Lyosh",
              avatar_url: "",
              [field]: value,
            },
          ],
        }),
      ),
    ).toBeNull();
  });

  it("returns null when timeline is not an object", () => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: null,
        }),
      ),
    ).toBeNull();
  });

  it.each([
    ["version", null],
    ["duration_ms", null],
    ["events", null],
    ["snapshots", null],
  ])("returns null when timeline field %s is invalid", (field, value) => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            [field]: value,
          }),
        }),
      ),
    ).toBeNull();
  });

  it("returns null when a timeline event item is not an object", () => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            events: [null],
          }),
        }),
      ),
    ).toBeNull();

    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            events: ["event"],
          }),
        }),
      ),
    ).toBeNull();
  });

  it.each([
    ["user_id", ""],
    ["seq", null],
    ["t_ms", null],
    ["type", ""],
    ["payload", null],
  ])("returns null when timeline event field %s is invalid", (field, value) => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            events: [
              {
                ...validTimelineEvent(),
                [field]: value,
              },
            ],
          }),
        }),
      ),
    ).toBeNull();
  });

  it("returns null when timeline event payload is not a record", () => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            events: [
              {
                ...validTimelineEvent(),
                payload: "payload",
              },
            ],
          }),
        }),
      ),
    ).toBeNull();

    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            events: [
              {
                ...validTimelineEvent(),
                payload: null,
              },
            ],
          }),
        }),
      ),
    ).toBeNull();
  });

  it("returns null when a timeline snapshot item is not an object", () => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            snapshots: [null],
          }),
        }),
      ),
    ).toBeNull();

    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            snapshots: ["snapshot"],
          }),
        }),
      ),
    ).toBeNull();
  });

  it.each([
    ["user_id", ""],
    ["seq", null],
    ["t_ms", null],
    ["language", ""],
  ])("returns null when timeline snapshot field %s is invalid", (field, value) => {
    expect(
      parseMatchReplayFromSnakeCase(
        validReplay({
          timeline: validTimeline({
            snapshots: [
              {
                ...validTimelineSnapshot(),
                [field]: value,
              },
            ],
          }),
        }),
      ),
    ).toBeNull();
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
          events: [validTimelineEvent()],
          snapshots: [validTimelineSnapshot()],
        },
      }),
    );

    expect(result?.timeline.submissions).toStrictEqual([]);
    expect(parseMatchSubmissionFromSnakeCase).not.toHaveBeenCalled();
  });

  it("returns null when a timeline submission cannot be parsed", () => {
    vi.mocked(parseMatchSubmissionFromSnakeCase).mockReturnValueOnce(null);

    expect(parseMatchReplayFromSnakeCase(validReplay())).toBeNull();
  });
});
