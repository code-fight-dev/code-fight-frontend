import type { LeaderboardEntry } from "../model/types";
import { getEntryTier, getEntryTierColor } from "../model/presentation";

type Props = {
  entry: LeaderboardEntry;
};

export function TierBadge({ entry }: Props) {
  const tier = getEntryTier(entry);
  const color = getEntryTierColor(entry);
  const isSTier = tier === "S";

  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-[11px] font-semibold"
      style={
        isSTier
          ? {
              color: "#8A6500",
              borderColor: "rgba(184, 134, 11, 0.46)",
              background:
                "linear-gradient(180deg, rgba(245, 197, 24, 0.24) 0%, rgba(212, 156, 10, 0.12) 100%)",
              boxShadow:
                "0 0 0 1px rgba(245, 197, 24, 0.12), 0 8px 18px rgba(212, 156, 10, 0.16)",
            }
          : {
              color,
              borderColor: `${color}44`,
              background: `${color}1A`,
            }
      }
    >
      {tier}
    </span>
  );
}
