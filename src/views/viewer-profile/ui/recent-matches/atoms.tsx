import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getDifficultyClassName, parseChallengeDifficulty } from "@/entities/challenge";
import {
  getAvatarAlt,
  getProfileInitial,
  shouldBypassAvatarOptimization,
} from "@/entities/viewer";
import type {
  ViewerProfileRecentMatch,
  ViewerProfileRecentMatchResult,
} from "@/entities/viewer";
import { buildArenaMatchHref } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatRecentMatchResult } from "@/views/viewer-profile/model/format";
import { getResultBadgeClassName } from "./formatters";

type MatchResultBadgeProps = {
  result: ViewerProfileRecentMatchResult;
};

export function MatchResultBadge({ result }: MatchResultBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase",
        getResultBadgeClassName(result),
      )}
    >
      {formatRecentMatchResult(result)}
    </span>
  );
}

type OpponentAvatarProps = {
  avatarUrl: string;
  username: string;
};

export function OpponentAvatar({ avatarUrl, username }: OpponentAvatarProps) {
  const hasAvatar = avatarUrl.trim() !== "";

  return (
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/12 bg-white/6 text-[15px] font-semibold text-(--app-text-strong)">
      {hasAvatar ? (
        <Image
          src={avatarUrl}
          alt={getAvatarAlt(username)}
          fill
          sizes="40px"
          unoptimized={shouldBypassAvatarOptimization(avatarUrl)}
          className="object-cover"
        />
      ) : (
        getProfileInitial(username)
      )}
    </span>
  );
}

type ReplayLinkProps = {
  matchId: string;
  fullWidth?: boolean;
};

export function ReplayLink({ matchId, fullWidth = false }: ReplayLinkProps) {
  return (
    <Link
      href={buildArenaMatchHref(matchId)}
      className={cn(
        "group inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[12px] font-medium tracking-[-0.02em] text-(--app-text-soft) transition-all duration-300 hover:border-blue-400/28 hover:bg-blue-500/10 hover:text-(--app-text-strong)",
        fullWidth ? "w-full" : "w-auto",
      )}
    >
      Open Replay
      <ArrowUpRight
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.9}
      />
    </Link>
  );
}

type DifficultyLabelProps = {
  difficulty: ViewerProfileRecentMatch["difficulty"];
};

export function DifficultyLabel({ difficulty }: DifficultyLabelProps) {
  const normalizedDifficulty = parseChallengeDifficulty(difficulty);
  if (!normalizedDifficulty) {
    return (
      <span className="text-[13px] font-semibold text-(--app-text-faint)">Unknown</span>
    );
  }

  return (
    <span
      className={cn(
        "text-[13px] font-semibold",
        getDifficultyClassName(normalizedDifficulty),
      )}
    >
      {normalizedDifficulty}
    </span>
  );
}
