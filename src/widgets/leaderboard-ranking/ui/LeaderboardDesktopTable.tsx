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

export function LeaderboardDesktopTable({ items, focusedUserId, viewerUserId }: Props) {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-white/10 lg:block">
      <table className="w-full min-w-245 border-collapse">
        <thead className="bg-white/6">
          <tr className="text-left">
            {["Rank", "Player", "Tier", "Rating", "Winrate", "W / L / D", "Games"].map(
              (label) => (
                <th
                  key={label}
                  className="border-r border-(--app-surface-strong-border) px-4 py-3 text-[11px] font-semibold tracking-[0.2em] text-(--app-text-faint) uppercase last:border-r-0"
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {items.map((entry, index) => (
            <tr
              key={entry.userId}
              id={`leaderboard-entry-desktop-${entry.userId}`}
              className={cn(
                index > 0 ? "border-t border-(--app-surface-strong-border)" : "",
                focusedUserId === entry.userId
                  ? "ring-1 ring-slate-300/60 ring-inset"
                  : "",
              )}
              style={{
                background:
                  index % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
              }}
            >
              <td className="px-4 py-4 text-[13px] font-semibold whitespace-nowrap text-(--app-text-strong)">
                #{entry.rank}
              </td>

              <td className="px-4 py-4">
                <PlayerIdentity
                  entry={entry}
                  isViewer={viewerUserId !== null && entry.userId === viewerUserId}
                />
              </td>

              <td className="px-4 py-4">
                <TierBadge entry={entry} />
              </td>

              <td className="px-4 py-4 text-[14px] font-semibold whitespace-nowrap text-(--app-text-strong)">
                {formatInteger(entry.rating)}
              </td>

              <td className="px-4 py-4 text-[13px] whitespace-nowrap text-(--app-text-strong)">
                {formatWinRate(entry.winRate)}
              </td>

              <td className="px-4 py-4 text-[13px] whitespace-nowrap text-(--app-text-soft)">
                {formatWLD(entry)}
              </td>

              <td className="px-4 py-4 text-[13px] whitespace-nowrap text-(--app-text-soft)">
                {formatInteger(getEntryGames(entry))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
