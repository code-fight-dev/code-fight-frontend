import { describe, expect, it } from "vitest";

import type { ViewerProfileEloHistoryPoint } from "@/entities/viewer";
import {
  clampTooltipPosition,
  createAreaPath,
  createLinePath,
  getChartCoordinates,
} from "@/views/viewer-profile/ui/EloHistoryChart";

type ChartPoint = ViewerProfileEloHistoryPoint & {
  x: number;
  y: number;
};

function createPoint(
  date: string,
  overrides: Partial<ViewerProfileEloHistoryPoint> = {},
): ViewerProfileEloHistoryPoint {
  return {
    date,
    delta: 0,
    rating: 1500,
    matchesPlayed: 1,
    ...overrides,
  };
}

function createChartPoint(
  x: number,
  y: number,
  overrides: Partial<ViewerProfileEloHistoryPoint> = {},
): ChartPoint {
  return {
    x,
    y,
    ...createPoint("2026-05-25", overrides),
  };
}

describe("views/viewer-profile/ui/EloHistoryChart helpers", () => {
  it("returns empty coordinates for empty point list", () => {
    expect(getChartCoordinates([])).toEqual([]);
  });

  it("sets x to center for a single point and distributes x for multiple points", () => {
    const singlePoint = getChartCoordinates([
      createPoint("2026-05-25", {
        rating: 1500,
      }),
    ]);
    expect(singlePoint[0]?.x).toBe(50);

    const points = getChartCoordinates([
      createPoint("2026-05-20", { rating: 1400 }),
      createPoint("2026-05-21", { rating: 1450 }),
      createPoint("2026-05-22", { rating: 1500 }),
    ]);

    expect(points[0]?.x).toBe(4);
    expect(points[1]?.x).toBeCloseTo(50.5, 5);
    expect(points[2]?.x).toBe(97);
  });

  it("builds line and area SVG paths, including empty-area fallback", () => {
    const points = [
      createChartPoint(4, 70),
      createChartPoint(50, 40),
      createChartPoint(97, 20),
    ];

    expect(createLinePath(points)).toBe("M 4 70 L 50 40 L 97 20");
    expect(createAreaPath(points)).toBe("M 4 70 L 50 40 L 97 20 L 97 86 L 4 86 Z");
    expect(createAreaPath([])).toBe("");
  });

  it("clamps tooltip position to chart bounds", () => {
    expect(clampTooltipPosition(5)).toBe(18);
    expect(clampTooltipPosition(50)).toBe(50);
    expect(clampTooltipPosition(95)).toBe(82);
  });
});
