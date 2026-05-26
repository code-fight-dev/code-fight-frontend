import { describe, expect, it } from "vitest";

import { formatRankValue, getRankByRating } from "@/entities/rank";
import type {
  ArenaMatchmakingState,
  ArenaQueueSettings,
} from "@/features/arena-matchmaking";
import type { ArenaPageData } from "@/views/arena/model/getArenaPageData";
import {
  formatDuration,
  getSelectedDifficultyLabel,
  getStartButtonLabel,
  getViewerCardPresentation,
} from "@/views/arena/model/presentation";

function createViewer(
  overrides: Partial<ArenaPageData["viewer"]> = {},
): ArenaPageData["viewer"] {
  return {
    username: "lyosh",
    avatarUrl: "https://cdn.example.com/avatar.png",
    eloRating: 1420,
    globalRank: 17,
    tier: getRankByRating(1420).tier,
    ...overrides,
  };
}

function findRatingForTier(targetTier: ReturnType<typeof getRankByRating>["tier"]) {
  for (let rating = 0; rating <= 5000; rating += 25) {
    if (getRankByRating(rating).tier === targetTier) {
      return rating;
    }
  }

  throw new Error(`No rating fixture found for rank tier ${targetTier}.`);
}

describe("views/arena/model/presentation", () => {
  describe("formatDuration", () => {
    it("formats seconds as mm:ss", () => {
      expect(formatDuration(0)).toBe("00:00");
      expect(formatDuration(9)).toBe("00:09");
      expect(formatDuration(65)).toBe("01:05");
      expect(formatDuration(600)).toBe("10:00");
    });

    it("clamps negative duration to zero", () => {
      expect(formatDuration(-15)).toBe("00:00");
    });
  });

  describe("getStartButtonLabel", () => {
    it("renders searching state with elapsed duration", () => {
      expect(getStartButtonLabel("searching", 75)).toBe("Searching 01:15");
    });

    it.each([
      "pending_accept",
      "waiting_opponent",
      "accepting",
    ] satisfies ArenaMatchmakingState[])(
      "renders match found label for %s state",
      (state) => {
        expect(getStartButtonLabel(state, 0)).toBe("Match found");
      },
    );

    it("renders default start matchmaking label for idle state", () => {
      expect(getStartButtonLabel("idle", 0)).toBe("Start matchmaking");
    });
  });

  describe("getSelectedDifficultyLabel", () => {
    it("renders hard difficulty label", () => {
      const taskMode: ArenaQueueSettings["taskMode"] = "hard";

      expect(getSelectedDifficultyLabel(taskMode)).toBe("Hard");
    });

    it("renders normal label for non-hard difficulty", () => {
      const taskMode: ArenaQueueSettings["taskMode"] = "normal";

      expect(getSelectedDifficultyLabel(taskMode)).toBe("Normal");
    });
  });

  describe("getViewerCardPresentation", () => {
    it("returns ranked viewer presentation with elo and global rank details", () => {
      const viewer = createViewer();
      const rankConfig = getRankByRating(1420);

      expect(getViewerCardPresentation(viewer, false)).toEqual({
        username: "lyosh",
        tierLabel: `Tier ${viewer.tier}`,
        tierStyle: {
          color: rankConfig.color,
          borderColor: `${rankConfig.color}44`,
          background: `${rankConfig.color}1A`,
        },
        details: `ELO ${formatRankValue(1420)} - Global #${formatRankValue(17)}`,
      });
    });

    it("returns special S-tier style when viewer rating belongs to S tier", () => {
      const sTierRating = findRatingForTier("S");
      const viewer = createViewer({
        eloRating: sTierRating,
        globalRank: 1,
        tier: getRankByRating(sTierRating).tier,
      });

      expect(getViewerCardPresentation(viewer, false)).toMatchObject({
        username: "lyosh",
        tierLabel: "Tier S",
        tierStyle: {
          color: "#8A6500",
          borderColor: "rgba(184, 134, 11, 0.46)",
          background:
            "linear-gradient(180deg, rgba(245, 197, 24, 0.24) 0%, rgba(212, 156, 10, 0.12) 100%)",
          boxShadow:
            "0 0 0 1px rgba(245, 197, 24, 0.12), 0 8px 18px rgba(212, 156, 10, 0.16)",
        },
        details: `ELO ${formatRankValue(sTierRating)} - Global #${formatRankValue(1)}`,
      });
    });

    it("returns guest presentation for anonymous viewer", () => {
      expect(
        getViewerCardPresentation(
          createViewer({
            username: null,
            eloRating: null,
            globalRank: null,
            tier: null,
          }),
          true,
        ),
      ).toEqual({
        username: "Guest",
        tierLabel: "Guest",
        tierStyle: undefined,
        details: "Read-only preview mode",
      });
    });

    it("returns unranked presentation for authenticated viewer without rating", () => {
      expect(
        getViewerCardPresentation(
          createViewer({
            eloRating: null,
            globalRank: null,
            tier: null,
          }),
          false,
        ),
      ).toEqual({
        username: "lyosh",
        tierLabel: "Unranked",
        tierStyle: undefined,
        details: "Ready to queue",
      });
    });

    it("uses elo-only details when global rank is missing", () => {
      const viewer = createViewer({
        globalRank: null,
      });

      expect(getViewerCardPresentation(viewer, false).details).toBe(
        `ELO ${formatRankValue(1420)}`,
      );
    });
  });
});
