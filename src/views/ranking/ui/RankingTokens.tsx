import { formatRankRange } from "@/entities/rank";
import type { RankConfig } from "@/entities/rank";
import { cn } from "@/shared/lib/cn";
import { getRankAccentStyles } from "../model/rankPresentation";

type RankingBandPillProps = {
  rank: RankConfig;
  mobile?: boolean;
};

export function RankingTierBadge({
  rank,
  className,
}: {
  rank: RankConfig;
  className?: string;
}) {
  const styles = getRankAccentStyles(rank);

  return (
    <span
      className={cn(
        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-[1.05rem] font-semibold shadow-[0_10px_24px_rgba(2,6,23,0.14)]",
        className,
      )}
      style={styles.tierBadge}
    >
      {rank.tier}
    </span>
  );
}

export function RankingBandPill({ rank, mobile = false }: RankingBandPillProps) {
  const styles = getRankAccentStyles(rank);

  return (
    <span
      className={
        mobile
          ? "inline-flex rounded-full border px-3 py-1.5 text-[12px] font-medium tracking-[0.12em] whitespace-nowrap text-(--app-text-faint) uppercase"
          : "inline-flex rounded-full border px-3.5 py-2 text-[13px] font-medium tracking-[-0.02em] whitespace-nowrap"
      }
      style={styles.bandPill}
    >
      {formatRankRange(rank)}
    </span>
  );
}
