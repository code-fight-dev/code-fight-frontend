import {
  formatInteger,
  formatWLD,
  formatWinRate,
  getEntryGames,
  PlayerIdentity,
  TierBadge,
} from "@/entities/leaderboard";
import type { LeaderboardEntry } from "@/entities/leaderboard";
import { cn } from "@/shared/lib/cn";

type Props = {
  items: LeaderboardEntry[];
  focusedUserId: string | null;
  viewerUserId: string | null;
};

export function LeaderboardMobileRows({ items, focusedUserId, viewerUserId }: Props) {
  return (
    <div className="grid gap-3 lg:hidden">
      {items.map((entry) => (
        <article
          key={entry.userId}
          id={`leaderboard-entry-mobile-${entry.userId}`}
          className={cn(
            "overflow-x-auto rounded-2xl border border-white/10 bg-white/3 p-4",
            focusedUserId === entry.userId ? "ring-1 ring-slate-300/60" : "",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-[13px] font-semibold text-(--app-text-strong)">
              #{entry.rank}
            </div>
            <TierBadge entry={entry} />
          </div>

          <div className="mt-3">
            <PlayerIdentity
              entry={entry}
              isViewer={viewerUserId !== null && entry.userId === viewerUserId}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <div className="text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
                Rating
              </div>
              <div className="mt-1 text-[16px] font-semibold text-(--app-text-strong)">
                {formatInteger(entry.rating)}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
                Winrate
              </div>
              <div className="mt-1 text-[16px] font-semibold text-(--app-text-strong)">
                {formatWinRate(entry.winRate)}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
                W / L / D
              </div>
              <div className="mt-1 text-[13px] whitespace-nowrap text-(--app-text-soft)">
                {formatWLD(entry)}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
                Games
              </div>
              <div className="mt-1 text-[13px] whitespace-nowrap text-(--app-text-soft)">
                {formatInteger(getEntryGames(entry))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
