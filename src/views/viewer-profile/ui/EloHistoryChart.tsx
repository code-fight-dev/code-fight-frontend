"use client";

import { useState } from "react";
import type { ViewerProfileEloHistoryPoint } from "@/entities/viewer";
import { cn } from "@/shared/lib/cn";
import {
  ELO_HISTORY_RANGES,
  getChartTicks,
  getEloHistoryPointsForRange,
} from "@/views/viewer-profile/model/chart";
import type { EloHistoryRange } from "@/views/viewer-profile/model/chart";
import { formatChartDate, formatSignedNumber } from "@/views/viewer-profile/model/format";
import { ProfileSection } from "@/views/viewer-profile/ui/ProfileSection";

type Props = {
  points: ViewerProfileEloHistoryPoint[];
  accentColor: string;
};

type ChartPoint = ViewerProfileEloHistoryPoint & {
  x: number;
  y: number;
};

export function EloHistoryChart({ points, accentColor }: Props) {
  const [range, setRange] = useState<EloHistoryRange>("6m");
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const filteredPoints = getEloHistoryPointsForRange(points, range);
  const chartPoints = getChartCoordinates(filteredPoints);
  const hoveredPoint =
    chartPoints.find((point) => point.date === hoveredDate) ?? chartPoints.at(-1) ?? null;
  const ticks = getChartTicks(filteredPoints);

  return (
    <ProfileSection
      title="Elo History"
      description="Daily Elo changes are grouped into clean time buckets for each selected range."
      actions={
        <div className="flex flex-wrap gap-2">
          {ELO_HISTORY_RANGES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
              className={cn(
                "app-segment min-h-10 rounded-full px-3.5 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors",
                range === option.id && "app-segment-active",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      {chartPoints.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 bg-white/3 px-4 py-10 text-center text-[15px] leading-[1.72] tracking-[-0.025em] text-(--app-text-muted)">
          Elo changes will appear here after rated matches are completed.
        </div>
      ) : (
        <div>
          <div className="relative h-64 overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 sm:h-78 sm:px-5">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
            >
              {[22, 42, 62, 82].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="0"
                />
              ))}

              <path
                d={createAreaPath(chartPoints)}
                fill={`url(#elo-fill-${range})`}
                stroke="none"
                opacity="0.9"
              />
              <path
                d={createLinePath(chartPoints)}
                fill="none"
                stroke={accentColor}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <defs>
                <linearGradient id={`elo-fill-${range}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity="0.34" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>

            {chartPoints.map((point) => (
              <button
                key={point.date}
                type="button"
                onMouseEnter={() => setHoveredDate(point.date)}
                onFocus={() => setHoveredDate(point.date)}
                onMouseLeave={() => setHoveredDate(null)}
                onBlur={() => setHoveredDate(null)}
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                }}
                aria-label={`${formatChartDate(point.date)} ${formatSignedNumber(point.delta)} Elo`}
              >
                <span
                  className="absolute inset-1 rounded-full"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 0 4px ${accentColor}22`,
                  }}
                />
              </button>
            ))}

            {hoveredPoint ? (
              <div
                className="pointer-events-none absolute z-10 min-w-34 -translate-x-1/2 rounded-[20px] border border-white/10 bg-[rgba(7,12,24,0.94)] px-3.5 py-3 shadow-[0_18px_42px_rgba(2,6,23,0.26)] backdrop-blur-xl sm:min-w-42 sm:px-4"
                style={{
                  left: `${clampTooltipPosition(hoveredPoint.x)}%`,
                  top: `${Math.max(hoveredPoint.y - 16, 8)}%`,
                }}
              >
                <div className="font-accent text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
                  {formatChartDate(hoveredPoint.date)}
                </div>
                <div className="mt-2 text-[1.15rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
                  {hoveredPoint.rating} Elo
                </div>
                <div
                  className="mt-1 text-[13px] font-medium tracking-[-0.02em]"
                  style={{ color: hoveredPoint.delta >= 0 ? "#34d399" : "#f87171" }}
                >
                  {formatSignedNumber(hoveredPoint.delta)} this period
                </div>
                <div className="mt-1 text-[12px] tracking-[-0.02em] text-(--app-text-muted)">
                  {hoveredPoint.matchesPlayed} rated match
                  {hoveredPoint.matchesPlayed === 1 ? "" : "es"}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 text-[11px] tracking-[0.16em] text-(--app-text-faint) uppercase sm:gap-3 sm:text-[12px]">
            {ticks.map((tick) => {
              const point = chartPoints.find((item) => item.date === tick.date);

              return (
                <span
                  key={tick.date}
                  className="whitespace-nowrap"
                  style={{
                    transform: point ? `translateX(${point.x / 50 - 1}%)` : undefined,
                  }}
                >
                  {formatChartDate(tick.date)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </ProfileSection>
  );
}

export function getChartCoordinates(
  points: ViewerProfileEloHistoryPoint[],
): ChartPoint[] {
  if (points.length === 0) {
    return [];
  }

  const left = 4;
  const right = 3;
  const top = 8;
  const bottom = 86;
  const ratings = points.map((point) => point.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const padding = Math.max(36, Math.round((maxRating - minRating) * 0.24));
  const domainMin = minRating - padding;
  const domainMax = maxRating + padding;
  const domain = Math.max(1, domainMax - domainMin);

  return points.map((point, index) => {
    const x =
      points.length === 1
        ? 50
        : left + (index / (points.length - 1)) * (100 - left - right);
    const y = top + (1 - (point.rating - domainMin) / domain) * (bottom - top);

    return {
      ...point,
      x,
      y,
    };
  });
}

export function createLinePath(points: ChartPoint[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function createAreaPath(points: ChartPoint[]) {
  if (points.length === 0) {
    return "";
  }

  const bottom = 86;
  const linePath = createLinePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${bottom} L ${firstPoint.x} ${bottom} Z`;
}

export function clampTooltipPosition(value: number) {
  if (value < 18) {
    return 18;
  }
  if (value > 82) {
    return 82;
  }

  return value;
}
