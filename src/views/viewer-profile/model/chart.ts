import type { ViewerProfileEloHistoryPoint } from "@/entities/viewer";

export type EloHistoryRange = "1m" | "3m" | "6m" | "12m";

type EloHistoryRangeConfig = {
  id: EloHistoryRange;
  label: string;
  days: number;
  bucketSize: number;
};

export const ELO_HISTORY_RANGES: EloHistoryRangeConfig[] = [
  { id: "1m", label: "1M", days: 31, bucketSize: 1 },
  { id: "3m", label: "3M", days: 92, bucketSize: 3 },
  { id: "6m", label: "6M", days: 183, bucketSize: 7 },
  { id: "12m", label: "1Y", days: 366, bucketSize: 14 },
];

export function getEloHistoryRange(range: EloHistoryRange) {
  return ELO_HISTORY_RANGES.find((item) => item.id === range) ?? ELO_HISTORY_RANGES[2];
}

export function getEloHistoryPointsForRange(
  points: ViewerProfileEloHistoryPoint[],
  range: EloHistoryRange,
) {
  const rangeConfig = getEloHistoryRange(range);
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - rangeConfig.days + 1);

  const filteredPoints = [...points]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .filter((point) => new Date(point.date).getTime() >= start.getTime());

  if (filteredPoints.length === 0 || rangeConfig.bucketSize === 1) {
    return filteredPoints;
  }

  const buckets = new Map<number, ViewerProfileEloHistoryPoint>();

  for (const point of filteredPoints) {
    const pointDate = new Date(point.date);
    pointDate.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor((pointDate.getTime() - start.getTime()) / 86_400_000);
    const bucketIndex = Math.max(0, Math.floor(dayDiff / rangeConfig.bucketSize));
    const currentBucket = buckets.get(bucketIndex);

    if (!currentBucket) {
      buckets.set(bucketIndex, { ...point });
      continue;
    }

    buckets.set(bucketIndex, {
      date: point.date,
      delta: currentBucket.delta + point.delta,
      rating: point.rating,
      matchesPlayed: currentBucket.matchesPlayed + point.matchesPlayed,
    });
  }

  return [...buckets.values()].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
  );
}

export function getChartTicks(points: ViewerProfileEloHistoryPoint[]) {
  if (points.length === 0) {
    return [];
  }

  const desiredTickCount = Math.min(4, points.length);
  const ticks: ViewerProfileEloHistoryPoint[] = [];

  for (let index = 0; index < desiredTickCount; index += 1) {
    const pointIndex =
      desiredTickCount === 1
        ? 0
        : Math.round((index / (desiredTickCount - 1)) * (points.length - 1));
    const point = points[pointIndex];

    if (point && ticks.at(-1)?.date !== point.date) {
      ticks.push(point);
    }
  }

  return ticks;
}
