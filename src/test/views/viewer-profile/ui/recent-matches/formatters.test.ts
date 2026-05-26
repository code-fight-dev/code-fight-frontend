import { describe, expect, it } from "vitest";

import type { ViewerProfileRecentMatch } from "@/entities/viewer";
import {
  formatEloDelta,
  getEloDeltaTextColor,
  getResultBadgeClassName,
} from "@/views/viewer-profile/ui/recent-matches/formatters";

function createMatch(
  overrides: Partial<ViewerProfileRecentMatch> = {},
): ViewerProfileRecentMatch {
  return {
    id: "match-1",
    result: "win",
    opponent: {
      id: "opponent-1",
      username: "rival",
      displayName: "Rival",
      avatarUrl: "",
    },
    difficulty: "medium",
    eloDelta: 12,
    isRated: true,
    finishedAt: "2026-05-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("views/viewer-profile/ui/recent-matches/formatters", () => {
  it("returns badge styles for all supported results and fallback branch", () => {
    expect(getResultBadgeClassName("win")).toContain("emerald");
    expect(getResultBadgeClassName("loss")).toContain("rose");
    expect(getResultBadgeClassName("draw")).toContain("sky");
    expect(getResultBadgeClassName("cancelled")).toContain("amber");
    expect(getResultBadgeClassName("unknown" as never)).toContain(
      "text-(--app-text-soft)",
    );
  });

  it("returns elo text color for unrated, positive, negative and zero deltas", () => {
    expect(getEloDeltaTextColor(createMatch({ isRated: false }))).toBe(
      "text-(--app-text-faint)",
    );
    expect(getEloDeltaTextColor(createMatch({ eloDelta: null }))).toBe(
      "text-(--app-text-faint)",
    );
    expect(getEloDeltaTextColor(createMatch({ eloDelta: 25 }))).toBe("text-emerald-200");
    expect(getEloDeltaTextColor(createMatch({ eloDelta: -10 }))).toBe("text-rose-200");
    expect(getEloDeltaTextColor(createMatch({ eloDelta: 0 }))).toBe(
      "text-(--app-text-soft)",
    );
  });

  it("formats elo delta for rated and unrated matches", () => {
    expect(formatEloDelta(createMatch({ isRated: false, eloDelta: 15 }))).toBe("Unrated");
    expect(formatEloDelta(createMatch({ isRated: true, eloDelta: null }))).toBe("-");
    expect(formatEloDelta(createMatch({ isRated: true, eloDelta: 11 }))).toBe("+11");
    expect(formatEloDelta(createMatch({ isRated: true, eloDelta: -8 }))).toBe("-8");
  });
});
