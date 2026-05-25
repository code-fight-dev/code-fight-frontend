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
  validTimelineEvent,
  validTimelineSnapshot,
} from "./replay.test-helpers";

vi.mock("@/entities/match/model/parsers/match", () => ({
  parseMatchFromSnakeCase: vi.fn(),
}));

vi.mock("@/entities/match/model/parsers/submission", () => ({
  parseMatchSubmissionFromSnakeCase: vi.fn(),
}));

describe("parseMatchReplayFromSnakeCase validation", () => {
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

  it("returns null when value is not an object", () => {
    expect(parseMatchReplayFromSnakeCase(null)).toBeNull();
    expect(parseMatchReplayFromSnakeCase(undefined)).toBeNull();
    expect(parseMatchReplayFromSnakeCase("replay")).toBeNull();
    expect(parseMatchReplayFromSnakeCase(123)).toBeNull();
    expect(parseMatchReplayFromSnakeCase([])).toBeNull();
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

  it("returns null when a timeline submission cannot be parsed", () => {
    vi.mocked(parseMatchSubmissionFromSnakeCase).mockReturnValueOnce(null);

    expect(parseMatchReplayFromSnakeCase(validReplay())).toBeNull();
  });
});
