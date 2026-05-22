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

export function RecentMatchesDesktopTable({ matches }: Props) {
  return (
    <div className="divide-y divide-white/8">
      {matches.map((match) => (
        <DesktopRecentMatchRow key={match.id} match={match} />
      ))}
    </div>
  );
}

type DesktopRecentMatchRowProps = {
  match: ViewerProfileRecentMatch;
};

function DesktopRecentMatchRow({ match }: DesktopRecentMatchRowProps) {
  const opponentDisplayName = match.opponent.displayName || match.opponent.username;

  return (
    <div className="grid grid-cols-[1.1fr_1.35fr_1fr_0.8fr_1fr] items-center gap-3 px-1 py-3.5">
      <div>
        <MatchResultBadge result={match.result} />
      </div>

      <div className="min-w-0">
        <Link
          href={buildViewerProfileHref(match.opponent.username)}
          className="group flex min-w-0 items-center gap-3 rounded-xl px-1 py-1 transition-colors duration-200 hover:bg-white/4"
        >
          <OpponentAvatar
            avatarUrl={match.opponent.avatarUrl}
            username={match.opponent.username}
          />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
              {opponentDisplayName}
            </div>
            <div className="mt-0.5 truncate text-[12px] tracking-[-0.02em] text-(--app-text-muted)">
              @{match.opponent.username} -{" "}
              <RecentMatchTimestamp value={match.finishedAt} />
            </div>
          </div>
        </Link>
      </div>

      <div>
        <DifficultyLabel difficulty={match.difficulty} />
      </div>

      <div
        className={cn(
          "text-[14px] font-semibold tracking-[-0.03em]",
          getEloDeltaTextColor(match),
        )}
      >
        {formatEloDelta(match)}
      </div>

      <div>
        <ReplayLink matchId={match.id} />
      </div>
    </div>
  );
}
