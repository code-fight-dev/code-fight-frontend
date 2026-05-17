import type { ArenaPageData } from "../model/getArenaPageData";

type Props = {
  stats: ArenaPageData["stats"];
};

export function ArenaStatsCards({ stats }: Props) {
  return (
    <div className="mt-7 grid gap-3 md:grid-cols-3">
      <article className="rounded-2xl border border-white/10 bg-white/3 px-5 py-4">
        <div className="text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
          Matches
        </div>
        <div className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-(--app-text-strong)">
          {stats?.totalMatches ?? 0}
          <span className="ml-2 align-middle text-sm font-medium text-(--app-text-muted)">
            played
          </span>
        </div>
      </article>
      <article className="rounded-2xl border border-white/10 bg-white/3 px-5 py-4">
        <div className="text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
          Win Rate
        </div>
        <div className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-(--app-text-strong)">
          {Math.round((stats?.winRate ?? 0) * 100)}%
          <span className="ml-2 align-middle text-sm font-medium text-(--app-text-muted)">
            rated only
          </span>
        </div>
      </article>
      <article className="rounded-2xl border border-white/10 bg-white/3 px-5 py-4">
        <div className="text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
          Wins
        </div>
        <div className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-(--app-text-strong)">
          {stats?.wins ?? 0}
          <span className="ml-2 align-middle text-sm font-medium text-(--app-text-muted)">
            {`${stats?.maxWinStreak ?? 0} streak`}
          </span>
        </div>
      </article>
    </div>
  );
}
