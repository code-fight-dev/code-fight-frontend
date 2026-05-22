import type {
  ViewerProfileRecentMatch,
  ViewerProfileRecentMatchResult,
} from "@/entities/viewer";
import { formatSignedNumber } from "@/views/viewer-profile/model/format";

export function getResultBadgeClassName(result: ViewerProfileRecentMatchResult) {
  switch (result) {
    case "win":
      return "border-emerald-300/30 bg-emerald-500/15 text-emerald-100";
    case "loss":
      return "border-rose-300/28 bg-rose-500/14 text-rose-100";
    case "draw":
      return "border-sky-300/28 bg-sky-500/14 text-sky-100";
    case "cancelled":
      return "border-amber-300/30 bg-amber-500/14 text-amber-100";
    default:
      return "border-white/18 bg-white/6 text-(--app-text-soft)";
  }
}

export function getEloDeltaTextColor(match: ViewerProfileRecentMatch) {
  if (!match.isRated || match.eloDelta === null) {
    return "text-(--app-text-faint)";
  }

  if (match.eloDelta > 0) {
    return "text-emerald-200";
  }

  if (match.eloDelta < 0) {
    return "text-rose-200";
  }

  return "text-(--app-text-soft)";
}

export function formatEloDelta(match: ViewerProfileRecentMatch) {
  if (!match.isRated) {
    return "Unrated";
  }

  if (match.eloDelta === null) {
    return "-";
  }

  return formatSignedNumber(match.eloDelta);
}
