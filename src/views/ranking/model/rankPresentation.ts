import type { CSSProperties } from "react";
import type { RankConfig } from "@/entities/rank";

export type RankAccentStyles = {
  bandPill: CSSProperties;
  mobileCard: CSSProperties;
  tierBadge: CSSProperties;
};

export const TABLE_HEADER_CLASS =
  "px-5 py-4 text-[11px] font-semibold tracking-[0.2em] text-(--app-text-faint) uppercase";
export const TABLE_CELL_CLASS =
  "border-r border-(--app-surface-strong-border) px-5 py-5 align-top";

const S_TIER_TEXT_COLOR = "#8A6500";

export function getRankAccentStyles(rank: RankConfig): RankAccentStyles {
  if (rank.tier === "S") {
    return {
      tierBadge: {
        color: S_TIER_TEXT_COLOR,
        borderColor: "rgba(184, 134, 11, 0.42)",
        background:
          "linear-gradient(180deg, rgba(245, 197, 24, 0.22) 0%, rgba(212, 156, 10, 0.12) 100%)",
        boxShadow:
          "0 0 0 1px rgba(245, 197, 24, 0.12), 0 12px 30px rgba(212, 156, 10, 0.16)",
      },
      bandPill: {
        color: S_TIER_TEXT_COLOR,
        borderColor: "rgba(184, 134, 11, 0.42)",
        background:
          "linear-gradient(180deg, rgba(245, 197, 24, 0.18) 0%, rgba(212, 156, 10, 0.1) 100%)",
        boxShadow:
          "0 0 0 1px rgba(245, 197, 24, 0.12), 0 10px 24px rgba(212, 156, 10, 0.12)",
      },
      mobileCard: {
        borderColor: "rgba(184, 134, 11, 0.3)",
        background:
          "linear-gradient(180deg, rgba(245, 197, 24, 0.14) 0%, rgba(255,255,255,0.03) 100%)",
      },
    };
  }

  return {
    tierBadge: {
      color: rank.color,
      borderColor: `${rank.color}44`,
      background: `${rank.color}18`,
    },
    bandPill: {
      color: rank.color,
      borderColor: `${rank.color}40`,
      background: `${rank.color}14`,
    },
    mobileCard: {
      borderColor: `${rank.color}38`,
      background: `linear-gradient(180deg, ${rank.color}14 0%, rgba(255,255,255,0.03) 100%)`,
    },
  };
}

export function getDesktopRowStyle(index: number): CSSProperties {
  return {
    background: index % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
  };
}
