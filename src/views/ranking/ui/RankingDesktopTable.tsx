import { RANKS } from "@/entities/rank";
import type { RankConfig } from "@/entities/rank";
import {
  getDesktopRowStyle,
  TABLE_CELL_CLASS,
  TABLE_HEADER_CLASS,
} from "../model/rankPresentation";
import { RankingBandPill, RankingTierBadge } from "./RankingTokens";

function RankingDesktopRow({ rank, index }: { rank: RankConfig; index: number }) {
  return (
    <tr
      className={index > 0 ? "border-t border-(--app-surface-strong-border)" : ""}
      style={getDesktopRowStyle(index)}
    >
      <td className={TABLE_CELL_CLASS}>
        <RankingTierBadge rank={rank} />
      </td>
      <td className={TABLE_CELL_CLASS}>
        <RankingBandPill rank={rank} />
      </td>
      <td
        className={`${TABLE_CELL_CLASS} text-[14px] leading-[1.72] tracking-[-0.02em] text-(--app-text-soft)`}
      >
        {rank.summary}
      </td>
      <td className="px-5 py-5 align-top text-[14px] leading-[1.72] tracking-[-0.02em] text-(--app-text-muted)">
        {rank.focus}
      </td>
    </tr>
  );
}

export function RankingDesktopTable() {
  return (
    <div className="hidden lg:block">
      <div className="overflow-hidden rounded-[28px] border border-white/10">
        <table className="w-full border-collapse">
          <thead className="bg-white/6">
            <tr className="text-left">
              <th
                className={`${TABLE_HEADER_CLASS} border-r border-(--app-surface-strong-border)`}
              >
                Tier
              </th>
              <th
                className={`${TABLE_HEADER_CLASS} border-r border-(--app-surface-strong-border)`}
              >
                Rating Band
              </th>
              <th
                className={`${TABLE_HEADER_CLASS} border-r border-(--app-surface-strong-border)`}
              >
                Explanation
              </th>
              <th className={TABLE_HEADER_CLASS}>Primary Focus</th>
            </tr>
          </thead>
          <tbody>
            {RANKS.map((rank, index) => (
              <RankingDesktopRow key={rank.tier} rank={rank} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
