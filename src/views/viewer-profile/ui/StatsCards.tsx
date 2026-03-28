import { Flame, Hourglass, TrendingUp, Trophy } from "lucide-react";
import type { ViewerProfileStats } from "@/entities/viewer";
import {
  formatDurationFromSeconds,
  formatInteger,
  formatPercent,
} from "@/views/viewer-profile/model/format";

type Props = {
  stats: ViewerProfileStats;
};

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      key: "elo-rating",
      label: "Current Elo",
      value: formatInteger(stats.eloRating),
      meta: "Current ladder rating",
      icon: TrendingUp,
    },
  ];

  cards.push(
    {
      key: "winrate",
      label: "Winrate",
      value: formatPercent(stats.winRate),
      meta: `${stats.wins}W / ${stats.losses}L / ${stats.draws}D`,
      icon: Trophy,
    },
    {
      key: "avg-time",
      label: "Avg Time",
      value: formatDurationFromSeconds(stats.avgSolutionTimeSeconds),
      meta:
        stats.avgSolutionTimeSeconds === null
          ? "Submission timing will appear after solved tasks."
          : "Average across submitted solutions",
      icon: Hourglass,
    },
    {
      key: "streak",
      label: "Streak",
      value: `${stats.maxWinStreak} ${stats.maxWinStreak === 1 ? "Win" : "Wins"}`,
      meta: stats.maxWinStreak === 1 ? "Personal best" : "Personal best",
      icon: Flame,
    },
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className="app-shell-card-soft profile-card-soft rounded-[26px] px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="font-accent text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
                {card.label}
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-blue-300">
                <Icon className="h-4.5 w-4.5" strokeWidth={1.95} />
              </span>
            </div>

            <div className="mt-5 text-[2.05rem] font-semibold tracking-[-0.07em] text-(--app-text-strong)">
              {card.value}
            </div>

            <div className="mt-2 text-[13px] leading-[1.6] tracking-[-0.02em] text-(--app-text-muted)">
              {card.meta}
            </div>
          </article>
        );
      })}
    </div>
  );
}
