import { Crown } from "lucide-react";
import {
  formatInteger,
  formatWinRate,
  PlayerIdentity,
  TierBadge,
} from "@/entities/leaderboard";
import type { LeaderboardEntry } from "@/entities/leaderboard";
import { cn } from "@/shared/lib/cn";

type Props = {
  items: LeaderboardEntry[];
};

function PodiumCard({
  entry,
  className,
}: {
  entry: LeaderboardEntry;
  className?: string;
}) {
  const isTopRank = entry.rank === 1;
  const rankPalette = isTopRank
    ? {
        borderColor: "rgba(245, 197, 24, 0.4)",
        background:
          "linear-gradient(180deg, rgba(245, 197, 24, 0.18) 0%, rgba(255, 255, 255, 0.03) 100%)",
        icon: "text-amber-300",
      }
    : entry.rank === 2
      ? {
          borderColor: "rgba(148, 163, 184, 0.34)",
          background:
            "linear-gradient(180deg, rgba(148, 163, 184, 0.14) 0%, rgba(255, 255, 255, 0.03) 100%)",
          icon: "text-slate-300",
        }
      : {
          borderColor: "rgba(251, 146, 60, 0.34)",
          background:
            "linear-gradient(180deg, rgba(251, 146, 60, 0.14) 0%, rgba(255, 255, 255, 0.03) 100%)",
          icon: "text-orange-300",
        };

  return (
    <article
      className={cn("overflow-x-auto rounded-2xl border px-4 py-4 sm:px-5", className)}
      style={{
        borderColor: rankPalette.borderColor,
        background: rankPalette.background,
        boxShadow: isTopRank
          ? "0 0 0 1px rgba(245, 197, 24, 0.2), 0 0 34px rgba(245, 197, 24, 0.28), 0 0 70px rgba(245, 197, 24, 0.16)"
          : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1 text-[12px] font-semibold tracking-[0.18em] uppercase ${rankPalette.icon}`}
        >
          <Crown className="h-3.5 w-3.5" strokeWidth={2} />#{entry.rank}
        </span>
        <TierBadge entry={entry} />
      </div>

      <div className="mt-3">
        <PlayerIdentity entry={entry} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
            Rating
          </div>
          <div className="mt-1 text-[1.9rem] font-semibold tracking-[-0.06em] text-(--app-text-strong)">
            {formatInteger(entry.rating)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
            Winrate
          </div>
          <div className="mt-1 text-[15px] font-semibold text-(--app-text-strong)">
            {formatWinRate(entry.winRate)}
          </div>
        </div>
      </div>
    </article>
  );
}

export function LeaderboardPodium({ items }: Props) {
  const podiumEntries = items.slice(0, 3);

  return (
    <section className="grid gap-3 lg:grid-cols-3">
      {podiumEntries.map((entry) => (
        <PodiumCard
          key={entry.userId}
          entry={entry}
          className={
            entry.rank === 1
              ? "lg:order-2"
              : entry.rank === 2
                ? "lg:order-1"
                : "lg:order-3"
          }
        />
      ))}
    </section>
  );
}
