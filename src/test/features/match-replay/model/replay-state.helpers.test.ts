import { describe, expect, it } from "vitest";

import {
  clampIndex,
  clampTime,
  mapReplayChallengeInfo,
  mapReplayMatchInfo,
  mapReplayPlayers,
  resolveInitialPlayerId,
} from "@/features/match-replay/model/replay-state/helpers";
import { createChallengeFixture } from "@/test/fixtures/challenge";
import { createMatchReplayFixture } from "./fixtures";

describe("features/match-replay/model/replay-state/helpers", () => {
  it("clamps replay time within [0, duration]", () => {
    expect(clampTime(Number.NaN, 100)).toBe(0);
    expect(clampTime(-50, 100)).toBe(0);
    expect(clampTime(250, 100)).toBe(100);
    expect(clampTime(45, 100)).toBe(45);
  });

  it("clamps checkpoint index within [0, max]", () => {
    expect(clampIndex(10, 0)).toBe(0);
    expect(clampIndex(-1, 4)).toBe(0);
    expect(clampIndex(9, 4)).toBe(4);
    expect(clampIndex(3, 4)).toBe(3);
  });

  it("resolves initial player from viewer id and falls back to first player", () => {
    const replay = createMatchReplayFixture();

    expect(resolveInitialPlayerId(replay, "viewer-2")).toBe("viewer-2");
    expect(resolveInitialPlayerId(replay, "viewer-404")).toBe("viewer-1");
    expect(resolveInitialPlayerId(replay, null)).toBe("viewer-1");
    expect(
      resolveInitialPlayerId(
        createMatchReplayFixture({
          players: [],
        }),
        null,
      ),
    ).toBeNull();
  });

  it("maps replay players to public player view models", () => {
    const replay = createMatchReplayFixture();

    expect(mapReplayPlayers(null)).toEqual([]);
    expect(mapReplayPlayers(replay)).toEqual([
      {
        id: "viewer-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: "https://example.com/alice.png",
      },
      {
        id: "viewer-2",
        username: "bob",
        displayName: "Bob",
        avatarUrl: "https://example.com/bob.png",
      },
    ]);
  });

  it("maps match and challenge metadata with null-safe fallbacks", () => {
    const replay = createMatchReplayFixture({
      match: {
        id: "match-42",
        status: "finished",
        taskId: undefined,
      },
    });
    const challenge = createChallengeFixture({
      title: "Replay Challenge",
      summary: "Summary for replay card",
    });

    expect(mapReplayMatchInfo(null)).toBeNull();
    expect(mapReplayMatchInfo(replay)).toEqual({
      id: "match-42",
      status: "finished",
      taskId: null,
    });

    expect(mapReplayChallengeInfo(null)).toBeNull();
    expect(mapReplayChallengeInfo(challenge)).toEqual({
      title: "Replay Challenge",
      summary: "Summary for replay card",
    });

    const challengeWithoutSummary = createChallengeFixture({
      summary: undefined as unknown as string,
    });
    expect(mapReplayChallengeInfo(challengeWithoutSummary)).toEqual({
      title: "Two Sum",
      summary: null,
    });
  });
});
