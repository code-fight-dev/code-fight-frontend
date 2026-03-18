import { RANKS } from "@/entities/rank";
import type { RankConfig } from "@/entities/rank";
import { getRankAccentStyles } from "../model/rankPresentation";
import { RankingBandPill, RankingTierBadge } from "./RankingTokens";

function RankingMobileCard({ rank }: { rank: RankConfig }) {
  const styles = getRankAccentStyles(rank);

  return (
    <article className="rounded-[26px] border p-4" style={styles.mobileCard}>
      <div className="flex items-center gap-3">
        <RankingTierBadge rank={rank} className="h-11 w-11 text-[1rem]" />
        <RankingBandPill rank={rank} mobile />
      </div>

      <p className="mt-4 text-[14px] leading-[1.7] tracking-[-0.02em] text-(--app-text-soft)">
        {rank.summary}
      </p>

      <div className="app-shell-card-soft mt-4 rounded-[20px] px-4 py-3 text-[13px] leading-[1.65] tracking-[-0.02em] text-(--app-text-muted)">
        <span className="font-medium text-(--app-text-strong)">Primary focus:</span>{" "}
        {rank.focus}
      </div>
    </article>
  );
}

export function RankingMobileCards() {
  return (
    <div className="grid gap-4 lg:hidden">
      {RANKS.map((rank) => (
        <RankingMobileCard key={rank.tier} rank={rank} />
      ))}
    </div>
  );
}
