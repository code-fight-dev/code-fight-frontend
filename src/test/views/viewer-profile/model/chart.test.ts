import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ViewerProfileEloHistoryPoint } from "@/entities/viewer";
import {
  getChartTicks,
  getEloHistoryPointsForRange,
  getEloHistoryRange,
} from "@/views/viewer-profile/model/chart";

function createPoint(
  date: string,
  overrides: Partial<ViewerProfileEloHistoryPoint> = {},
): ViewerProfileEloHistoryPoint {
  return {
    date,
    delta: 10,
    rating: 1500,
    matchesPlayed: 1,
    ...overrides,
  };
}

describe("views/viewer-profile/model/chart", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns configured elo history ranges and falls back for unknown id", () => {
    expect(getEloHistoryRange("1m")).toEqual({
      id: "1m",
      label: "1M",
      days: 31,
      bucketSize: 1,
    });

    expect(getEloHistoryRange("invalid" as never)).toEqual({
      id: "6m",
      label: "6M",
      days: 183,
      bucketSize: 7,
    });
  });

  it("filters and sorts points for 1m range without bucketing", () => {
    const points = [
      createPoint("2026-05-20", { rating: 1510 }),
      createPoint("2026-04-20", { rating: 1400 }),
      createPoint("2026-05-25", { rating: 1530 }),
      createPoint("2026-05-01", { rating: 1450 }),
    ];

    const result = getEloHistoryPointsForRange(points, "1m");

    expect(result).toEqual([
      createPoint("2026-05-01", { rating: 1450 }),
      createPoint("2026-05-20", { rating: 1510 }),
      createPoint("2026-05-25", { rating: 1530 }),
    ]);
  });

  it("returns empty result when no points fit selected range", () => {
    const points = [
      createPoint("2025-01-01", { rating: 1200 }),
      createPoint("2025-02-01", { rating: 1250 }),
    ];

    expect(getEloHistoryPointsForRange(points, "3m")).toEqual([]);
  });

  it("aggregates points into buckets for non-1m ranges", () => {
    const points = [
      createPoint("2026-03-01T12:00:00.000Z", {
        delta: 5,
        rating: 1400,
        matchesPlayed: 1,
      }),
      createPoint("2026-03-02T12:00:00.000Z", {
        delta: -2,
        rating: 1398,
        matchesPlayed: 1,
      }),
      createPoint("2026-03-03T12:00:00.000Z", {
        delta: 8,
        rating: 1406,
        matchesPlayed: 2,
      }),
      createPoint("2026-03-05T12:00:00.000Z", {
        delta: 1,
        rating: 1407,
        matchesPlayed: 1,
      }),
      createPoint("2026-03-10T12:00:00.000Z", {
        delta: 4,
        rating: 1411,
        matchesPlayed: 1,
      }),
    ];

    const result = getEloHistoryPointsForRange(points, "3m");

    expect(result).toEqual([
      {
        date: "2026-03-01T12:00:00.000Z",
        delta: 5,
        rating: 1400,
        matchesPlayed: 1,
      },
      {
        date: "2026-03-03T12:00:00.000Z",
        delta: 6,
        rating: 1406,
        matchesPlayed: 3,
      },
      {
        date: "2026-03-05T12:00:00.000Z",
        delta: 1,
        rating: 1407,
        matchesPlayed: 1,
      },
      {
        date: "2026-03-10T12:00:00.000Z",
        delta: 4,
        rating: 1411,
        matchesPlayed: 1,
      },
    ]);
  });

  it("builds chart ticks for empty, single, and duplicate-date histories", () => {
    expect(getChartTicks([])).toEqual([]);

    const onePoint = [createPoint("2026-05-20", { rating: 1600 })];
    expect(getChartTicks(onePoint)).toEqual(onePoint);

    const duplicateDates = [
      createPoint("2026-05-01T12:00:00.000Z", { rating: 1400 }),
      createPoint("2026-05-01T12:00:00.000Z", { rating: 1401 }),
      createPoint("2026-05-02T12:00:00.000Z", { rating: 1405 }),
      createPoint("2026-05-03T12:00:00.000Z", { rating: 1410 }),
      createPoint("2026-05-03T12:00:00.000Z", { rating: 1411 }),
    ];

    expect(getChartTicks(duplicateDates)).toEqual([duplicateDates[0], duplicateDates[3]]);
  });
});
