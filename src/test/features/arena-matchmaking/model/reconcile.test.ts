import { describe, expect, it } from "vitest";

import { createMatchFixture } from "@/test/entities/match/match.test-helpers";
import {
  getMatchVersion,
  getReadyState,
  toPendingState,
} from "@/features/arena-matchmaking/model/reconcile";

describe("getMatchVersion", () => {
  it("uses updatedAt timestamp when it is valid", () => {
    const match = createMatchFixture({
      updatedAt: "2026-05-24T10:05:00.000Z",
      createdAt: "2026-05-24T10:00:00.000Z",
    });

    expect(getMatchVersion(match)).toBe(Date.parse("2026-05-24T10:05:00.000Z"));
  });

  it("falls back to createdAt timestamp when updatedAt is invalid", () => {
    const match = createMatchFixture({
      updatedAt: "invalid-date",
      createdAt: "2026-05-24T10:00:00.000Z",
    });

    expect(getMatchVersion(match)).toBe(Date.parse("2026-05-24T10:00:00.000Z"));
  });

  it("returns 0 when both dates are invalid", () => {
    const match = createMatchFixture({
      updatedAt: "invalid-date",
      createdAt: "also-invalid",
    });

    expect(getMatchVersion(match)).toBe(0);
  });
});

describe("getReadyState", () => {
  it("returns both false when viewer or match is missing", () => {
    expect(getReadyState(null, "viewer-1")).toEqual({
      selfAccepted: false,
      opponentAccepted: false,
    });

    expect(getReadyState(createMatchFixture(), null)).toEqual({
      selfAccepted: false,
      opponentAccepted: false,
    });
  });

  it("maps readiness from player1 perspective", () => {
    const match = createMatchFixture({
      player1Ready: true,
      player2Ready: false,
    });

    expect(getReadyState(match, "viewer-1")).toEqual({
      selfAccepted: true,
      opponentAccepted: false,
    });
  });

  it("maps readiness from player2 perspective", () => {
    const match = createMatchFixture({
      player1Ready: true,
      player2Ready: false,
    });

    expect(getReadyState(match, "viewer-2")).toEqual({
      selfAccepted: false,
      opponentAccepted: true,
    });
  });

  it("returns both false for unrelated viewer", () => {
    expect(getReadyState(createMatchFixture(), "viewer-3")).toEqual({
      selfAccepted: false,
      opponentAccepted: false,
    });
  });
});

describe("toPendingState", () => {
  it("returns pending_accept when viewer has not accepted yet", () => {
    const match = createMatchFixture({
      player1Ready: false,
      player2Ready: true,
    });

    expect(toPendingState(match, "viewer-1")).toBe("pending_accept");
  });

  it("returns waiting_opponent when viewer accepted but opponent has not", () => {
    const match = createMatchFixture({
      player1Ready: true,
      player2Ready: false,
    });

    expect(toPendingState(match, "viewer-1")).toBe("waiting_opponent");
  });

  it("returns accepting when both players accepted", () => {
    const match = createMatchFixture({
      player1Ready: true,
      player2Ready: true,
    });

    expect(toPendingState(match, "viewer-1")).toBe("accepting");
  });
});
