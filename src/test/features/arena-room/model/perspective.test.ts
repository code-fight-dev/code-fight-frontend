import { describe, expect, it } from "vitest";

import { getMatchPerspective } from "@/features/arena-room/model/perspective";
import { createArenaMatchFixture } from "./fixtures";

describe("getMatchPerspective", () => {
  it("returns empty perspective when match or viewer is missing", () => {
    expect(getMatchPerspective(null, "viewer-1")).toEqual({
      selfScore: 0,
      opponentScore: 0,
      selfAttempts: 0,
      opponentAttempts: 0,
      selfSolved: false,
      opponentSolved: false,
    });

    expect(getMatchPerspective(createArenaMatchFixture(), null)).toEqual({
      selfScore: 0,
      opponentScore: 0,
      selfAttempts: 0,
      opponentAttempts: 0,
      selfSolved: false,
      opponentSolved: false,
    });
  });

  it("maps score/attempts/solved for player1 viewer", () => {
    const result = getMatchPerspective(
      createArenaMatchFixture({
        player1Id: "viewer-1",
        player2Id: "viewer-2",
        player1Score: 120,
        player2Score: 90,
        player1Attempts: 3,
        player2Attempts: 4,
        player1Solved: true,
        player2Solved: false,
      }),
      "viewer-1",
    );

    expect(result).toEqual({
      selfScore: 120,
      opponentScore: 90,
      selfAttempts: 3,
      opponentAttempts: 4,
      selfSolved: true,
      opponentSolved: false,
    });
  });

  it("maps score/attempts/solved for player2 viewer", () => {
    const result = getMatchPerspective(
      createArenaMatchFixture({
        player1Id: "viewer-1",
        player2Id: "viewer-2",
        player1Score: 120,
        player2Score: 90,
        player1Attempts: 3,
        player2Attempts: 4,
        player1Solved: true,
        player2Solved: false,
      }),
      "viewer-2",
    );

    expect(result).toEqual({
      selfScore: 90,
      opponentScore: 120,
      selfAttempts: 4,
      opponentAttempts: 3,
      selfSolved: false,
      opponentSolved: true,
    });
  });

  it("returns empty perspective for unrelated viewer", () => {
    expect(getMatchPerspective(createArenaMatchFixture(), "viewer-999")).toEqual({
      selfScore: 0,
      opponentScore: 0,
      selfAttempts: 0,
      opponentAttempts: 0,
      selfSolved: false,
      opponentSolved: false,
    });
  });
});
