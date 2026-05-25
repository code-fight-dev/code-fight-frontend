import { describe, expect, it } from "vitest";

import { createMatchFixture } from "@/test/entities/match/match.test-helpers";
import {
  ACCEPT_WINDOW_SECONDS,
  getAcceptRemainingSeconds,
  getSearchElapsedSeconds,
  shouldTickNow,
} from "@/features/arena-matchmaking/model/timers";

describe("shouldTickNow", () => {
  it.each([
    ["searching", true],
    ["pending_accept", true],
    ["waiting_opponent", true],
    ["idle", false],
    ["accepting", false],
    ["starting", false],
    ["error", false],
  ] as const)("returns %s -> %s", (state, expected) => {
    expect(shouldTickNow(state)).toBe(expected);
  });
});

describe("getSearchElapsedSeconds", () => {
  it("returns 0 when search start time is missing", () => {
    expect(getSearchElapsedSeconds(Date.now(), null)).toBe(0);
  });

  it("returns elapsed seconds with floor rounding", () => {
    expect(getSearchElapsedSeconds(5_001, 1_000)).toBe(4);
    expect(getSearchElapsedSeconds(5_999, 1_000)).toBe(4);
  });

  it("never returns negative value", () => {
    expect(getSearchElapsedSeconds(1_000, 5_000)).toBe(0);
  });
});

describe("getAcceptRemainingSeconds", () => {
  it("returns full accept window when match is missing or not pending", () => {
    expect(getAcceptRemainingSeconds(Date.now(), null)).toBe(ACCEPT_WINDOW_SECONDS);
    expect(
      getAcceptRemainingSeconds(
        Date.now(),
        createMatchFixture({
          status: "running",
        }),
      ),
    ).toBe(ACCEPT_WINDOW_SECONDS);
  });

  it("returns full accept window when createdAt cannot be parsed", () => {
    expect(
      getAcceptRemainingSeconds(
        Date.now(),
        createMatchFixture({
          createdAt: "invalid-date",
        }),
      ),
    ).toBe(ACCEPT_WINDOW_SECONDS);
  });

  it("returns remaining seconds inside accept window", () => {
    const now = Date.parse("2026-05-24T10:00:12.500Z");
    const match = createMatchFixture({
      createdAt: "2026-05-24T10:00:00.000Z",
    });

    expect(getAcceptRemainingSeconds(now, match)).toBe(18);
  });

  it("returns 0 when accept window is exceeded", () => {
    const now = Date.parse("2026-05-24T10:01:00.000Z");
    const match = createMatchFixture({
      createdAt: "2026-05-24T10:00:00.000Z",
    });

    expect(getAcceptRemainingSeconds(now, match)).toBe(0);
  });
});
