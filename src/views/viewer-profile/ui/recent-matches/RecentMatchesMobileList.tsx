import Link from "next/link";
import type { ViewerProfileRecentMatch } from "@/entities/viewer";
import { buildViewerProfileHref } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { DifficultyLabel, MatchResultBadge, OpponentAvatar, ReplayLink } from "./atoms";
import { formatEloDelta, getEloDeltaTextColor } from "./formatters";
import { RecentMatchTimestamp } from "./RecentMatchTimestamp";

type Props = {
  matches: ViewerProfileRecentMatch[];
};

export function RecentMatchesMobileList({ matches }: Props) {
  return (
    <div className="divide-y divide-white/8">
      {matches.map((match) => (
        <MobileRecentMatchRow key={match.id} match={match} />
      ))}
    </div>
  );
}

type MobileRecentMatchRowProps = {
  match: ViewerProfileRecentMatch;
};

function MobileRecentMatchRow({ match }: MobileRecentMatchRowProps) {
  const opponentDisplayName = match.opponent.displayName || match.opponent.username;

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <MatchResultBadge result={match.result} />
        <span className="text-[12px] tracking-[-0.02em] text-(--app-text-muted)">
          <RecentMatchTimestamp value={match.finishedAt} />
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <OpponentAvatar
          avatarUrl={match.opponent.avatarUrl}
          username={match.opponent.username}
        />
        <div className="min-w-0">
          <Link
            href={buildViewerProfileHref(match.opponent.username)}
            className="block truncate text-[14px] font-semibold tracking-[-0.03em] text-(--app-text-strong) hover:text-blue-200"
          >
            {opponentDisplayName}
          </Link>
          <div className="mt-0.5 truncate text-[12px] tracking-[-0.02em] text-(--app-text-muted)">
            @{match.opponent.username}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="inline-flex items-center gap-2 text-[12px] tracking-[0.14em] text-(--app-text-faint) uppercase">
          <span>Difficulty</span>
          <DifficultyLabel difficulty={match.difficulty} />
        </div>
        <div className="inline-flex items-center gap-2 text-[12px] tracking-[0.14em] text-(--app-text-faint) uppercase">
          <span>Elo Delta</span>
          <span className={cn("text-[13px] font-semibold", getEloDeltaTextColor(match))}>
            {formatEloDelta(match)}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <ReplayLink matchId={match.id} fullWidth />
      </div>
    </div>
  );
}
