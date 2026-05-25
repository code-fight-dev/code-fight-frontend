import { describe, expect, it } from "vitest";

import type { MatchReplayTimelineEvent } from "@/entities/match";
import {
  applyReplayTextChange,
  parseReplayTimelineEvent,
  REPLAY_KEYFRAME_STRATEGY,
  REPLAY_PROTOCOL_EVENT_TYPES,
} from "@/features/match-replay/model/protocol";

function createTimelineEvent(
  overrides: Partial<MatchReplayTimelineEvent> = {},
): MatchReplayTimelineEvent {
  return {
    userId: "viewer-1",
    seq: 1,
    tMs: 120,
    type: "insert",
    payload: {},
    ...overrides,
  };
}

describe("features/match-replay/model/protocol", () => {
  it("exposes stable protocol constants", () => {
    expect(REPLAY_PROTOCOL_EVENT_TYPES).toEqual([
      "insert",
      "delete",
      "replace",
      "language_switch",
      "cursor",
      "selection",
    ]);
    expect(REPLAY_KEYFRAME_STRATEGY).toEqual({
      maxEventsBetweenSnapshots: 100,
      maxMsBetweenSnapshots: 3000,
    });
  });

  it("parses text change events with payload aliases", () => {
    const parsed = parseReplayTimelineEvent(
      createTimelineEvent({
        type: "replace",
        payload: {
          offset: 3,
          length: 2,
          text: "XY",
        },
      }),
    );

    expect(parsed).toEqual({
      userId: "viewer-1",
      seq: 1,
      tMs: 120,
      type: "replace",
      payload: {
        rangeOffset: 3,
        rangeLength: 2,
        text: "XY",
      },
    });
  });

  it("defaults missing range length to zero for text changes", () => {
    const parsed = parseReplayTimelineEvent(
      createTimelineEvent({
        type: "insert",
        payload: {
          rangeOffset: 2,
          text: "A",
        },
      }),
    );

    expect(parsed?.type).toBe("insert");
    expect(parsed?.payload).toEqual({
      rangeOffset: 2,
      rangeLength: 0,
      text: "A",
    });
  });

  it("returns null for invalid text payload", () => {
    expect(
      parseReplayTimelineEvent(
        createTimelineEvent({
          payload: {
            rangeOffset: -1,
            rangeLength: 0,
            text: "A",
          },
        }),
      ),
    ).toBeNull();

    expect(
      parseReplayTimelineEvent(
        createTimelineEvent({
          payload: {
            rangeOffset: Number.NaN,
            rangeLength: 0,
          },
        }),
      ),
    ).toBeNull();

    expect(
      parseReplayTimelineEvent(
        createTimelineEvent({
          payload: {
            rangeOffset: 1.5,
            rangeLength: 0,
          },
        }),
      ),
    ).toBeNull();
  });

  it("parses language switch and rejects empty or unsupported events", () => {
    expect(
      parseReplayTimelineEvent(
        createTimelineEvent({
          type: "language_switch",
          payload: {
            language: "  python  ",
          },
        }),
      ),
    ).toEqual({
      userId: "viewer-1",
      seq: 1,
      tMs: 120,
      type: "language_switch",
      payload: {
        language: "python",
      },
    });

    expect(
      parseReplayTimelineEvent(
        createTimelineEvent({
          type: "language_switch",
          payload: {
            language: "   ",
          },
        }),
      ),
    ).toBeNull();

    expect(
      parseReplayTimelineEvent(
        createTimelineEvent({
          type: "cursor",
          payload: {
            line: 10,
          },
        }),
      ),
    ).toBeNull();
  });

  it("applies text mutations and rejects invalid mutation ranges", () => {
    expect(
      applyReplayTextChange("abcdef", {
        rangeOffset: 2,
        rangeLength: 0,
        text: "X",
      }),
    ).toBe("abXcdef");

    expect(
      applyReplayTextChange("abcdef", {
        rangeOffset: 1,
        rangeLength: 3,
        text: "",
      }),
    ).toBe("aef");

    expect(
      applyReplayTextChange("abcdef", {
        rangeOffset: 2,
        rangeLength: 2,
        text: "ZZ",
      }),
    ).toBe("abZZef");

    expect(
      applyReplayTextChange("abcdef", {
        rangeOffset: 99,
        rangeLength: 1,
        text: "Z",
      }),
    ).toBeNull();

    expect(
      applyReplayTextChange("abcdef", {
        rangeOffset: 5,
        rangeLength: 2,
        text: "Z",
      }),
    ).toBeNull();

    expect(
      applyReplayTextChange("abcdef", {
        rangeOffset: 3,
        rangeLength: -1,
        text: "Z",
      }),
    ).toBeNull();
  });
});
