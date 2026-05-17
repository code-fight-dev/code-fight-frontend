import type { CSSProperties } from "react";
import { formatRankValue, getRankByRating } from "@/entities/rank";
import type {
  ArenaMatchmakingState,
  ArenaQueueSettings,
} from "@/features/arena-matchmaking";
import type { ArenaPageData } from "./getArenaPageData";

type ViewerCardPresentation = {
  username: string;
  tierLabel: string;
  tierStyle: CSSProperties | undefined;
  details: string;
};

export function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export function getStartButtonLabel(
  state: ArenaMatchmakingState,
  searchElapsedSeconds: number,
) {
  if (state === "searching") {
    return `Searching ${formatDuration(searchElapsedSeconds)}`;
  }

  if (
    state === "pending_accept" ||
    state === "waiting_opponent" ||
    state === "accepting"
  ) {
    return "Match found";
  }

  return "Start matchmaking";
}

export function getSelectedDifficultyLabel(taskMode: ArenaQueueSettings["taskMode"]) {
  return taskMode === "hard" ? "Hard" : "Normal";
}

export function getViewerCardPresentation(
  viewer: ArenaPageData["viewer"],
  isGuest: boolean,
): ViewerCardPresentation {
  const username = viewer.username ?? "Guest";
  const tierLabel = viewer.tier ? `Tier ${viewer.tier}` : isGuest ? "Guest" : "Unranked";

  const rankConfig = viewer.eloRating !== null ? getRankByRating(viewer.eloRating) : null;
  const tierStyle = rankConfig
    ? rankConfig.tier === "S"
      ? {
          color: "#8A6500",
          borderColor: "rgba(184, 134, 11, 0.46)",
          background:
            "linear-gradient(180deg, rgba(245, 197, 24, 0.24) 0%, rgba(212, 156, 10, 0.12) 100%)",
          boxShadow:
            "0 0 0 1px rgba(245, 197, 24, 0.12), 0 8px 18px rgba(212, 156, 10, 0.16)",
        }
      : {
          color: rankConfig.color,
          borderColor: `${rankConfig.color}44`,
          background: `${rankConfig.color}1A`,
        }
    : undefined;

  const globalRankLabel =
    viewer.globalRank !== null ? `Global #${formatRankValue(viewer.globalRank)}` : null;
  const eloLabel =
    viewer.eloRating !== null ? `ELO ${formatRankValue(viewer.eloRating)}` : null;
  const details =
    eloLabel && globalRankLabel
      ? `${eloLabel} - ${globalRankLabel}`
      : (eloLabel ?? (isGuest ? "Read-only preview mode" : "Ready to queue"));

  return {
    username,
    tierLabel,
    tierStyle,
    details,
  };
}
