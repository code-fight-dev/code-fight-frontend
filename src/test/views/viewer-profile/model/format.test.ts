import { describe, expect, it } from "vitest";

import {
  formatChartDate,
  formatCompactNumber,
  formatDurationFromSeconds,
  formatInteger,
  formatJoinedDate,
  formatPercent,
  formatRecentMatchFinishedAt,
  formatRecentMatchResult,
  formatSignedNumber,
} from "@/views/viewer-profile/model/format";

describe("views/viewer-profile/model/format", () => {
  it("formats joined date as month and year", () => {
    expect(formatJoinedDate("2026-05-24T12:00:00.000Z")).toBe("May 2026");
  });

  it("formats percentages with default and custom precision", () => {
    expect(formatPercent(0.734)).toBe("73.4%");
    expect(formatPercent(0.734, 0)).toBe("73%");
  });

  it("formats durations and handles missing values", () => {
    expect(formatDurationFromSeconds(null)).toBe("No data yet");
    expect(formatDurationFromSeconds(125)).toBe("2:05");
  });

  it("formats signed numbers", () => {
    expect(formatSignedNumber(17)).toBe("+17");
    expect(formatSignedNumber(0)).toBe("0");
    expect(formatSignedNumber(-9)).toBe("-9");
  });

  it("formats chart date, compact number and integer values", () => {
    expect(formatChartDate("2026-05-24T12:00:00.000Z")).toBe("May 24");
    expect(formatCompactNumber(1500)).toBe("1.5K");
    expect(formatInteger(1234567)).toBe("1,234,567");
  });

  it("formats all recent match result variants and default fallback", () => {
    expect(formatRecentMatchResult("win")).toBe("Win");
    expect(formatRecentMatchResult("loss")).toBe("Loss");
    expect(formatRecentMatchResult("draw")).toBe("Draw");
    expect(formatRecentMatchResult("cancelled")).toBe("Cancelled");
    expect(formatRecentMatchResult("unknown" as never)).toBe("unknown");
  });

  it("formats finished timestamp, supports timezone and falls back for invalid date", () => {
    const value = "2026-05-01T10:00:00.000Z";
    const expectedUtc = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(new Date(value));

    expect(formatRecentMatchFinishedAt(value, "UTC")).toBe(expectedUtc);
    expect(formatRecentMatchFinishedAt(value)).not.toBe(value);
    expect(formatRecentMatchFinishedAt("not-a-date")).toBe("not-a-date");
  });
});
