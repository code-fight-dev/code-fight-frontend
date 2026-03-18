import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Globe2, MapPinned, Sparkles } from "lucide-react";
import { getNextRank, getRankByRating, getRankGradient } from "@/entities/rank";
import { RANKING_HREF } from "@/shared/config/routes";
import { resolveCountryCode } from "@/shared/lib/country";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import { formatInteger } from "../model/format";
import { ProfileSection } from "./ProfileSection";

const MIN_PROGRESS_WIDTH_PERCENT = 8;

type RankingCardProps = {
  leading: ReactNode;
  label: string;
  description?: string;
  value: string;
};

function hasResolvedRanking(
  rank: number | null,
  playersCount: number | null,
): rank is number {
  return rank !== null && playersCount !== null;
}

function RankingCard({ leading, label, description, value }: RankingCardProps) {
  return (
    <div className="app-shell-card-soft flex items-center justify-between gap-3 rounded-[20px] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <div className="min-w-0">
          <div className="text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
            {label}
          </div>
          {description ? (
            <div className="mt-1 text-[13px] tracking-[-0.02em] text-(--app-text-muted)">
              {description}
            </div>
          ) : null}
        </div>
      </div>

      <div className="text-right">
        <div className="text-[1.05rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
          {value}
        </div>
      </div>
    </div>
  );
}

type Props = {
  rating: number;
  country: string;
  countryCode: string;
  globalRank: number | null;
  globalPlayersCount: number | null;
  regionalRank: number | null;
  regionalPlayersCount: number | null;
};

export function RankProgression({
  rating,
  country,
  countryCode,
  globalRank,
  globalPlayersCount,
  regionalRank,
  regionalPlayersCount,
}: Props) {
  const currentRank = getRankByRating(rating);
  const nextRank = getNextRank(rating);
  const eloNeeded = nextRank ? Math.max(nextRank.min - rating, 0) : 0;
  const progressRangeMax = currentRank.max ?? nextRank?.min ?? rating;
  const progressWithinRank =
    progressRangeMax === currentRank.min
      ? 1
      : (rating - currentRank.min) / (progressRangeMax - currentRank.min);
  const progressGradient = getRankGradient(currentRank.color, nextRank?.color);
  const progressWidthPercent = Math.max(
    MIN_PROGRESS_WIDTH_PERCENT,
    Math.min(100, progressWithinRank * 100),
  );
  const hasGlobalRanking = hasResolvedRanking(globalRank, globalPlayersCount);
  const hasRegionalRanking =
    country !== "" && hasResolvedRanking(regionalRank, regionalPlayersCount);
  const regionalCountryCode = resolveCountryCode(countryCode, country);

  return (
    <ProfileSection
      title="Rank Progression"
      description="Track your current division and open the full ladder for every tier, color, and explanation."
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-accent text-[11px] tracking-[0.2em] text-(--app-text-faint) uppercase">
              Current Division
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span
                className="inline-flex h-13 w-13 items-center justify-center rounded-[18px] border text-[1.15rem] font-semibold shadow-[0_10px_24px_rgba(2,6,23,0.16)]"
                style={{
                  color: currentRank.color,
                  borderColor: `${currentRank.color}40`,
                  background: `${currentRank.color}18`,
                }}
              >
                {currentRank.tier}
              </span>
              <div>
                <div className="text-[1.15rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
                  {formatInteger(rating)} Elo
                </div>
                <div className="mt-1 text-[13px] tracking-[-0.02em] text-(--app-text-muted)">
                  {nextRank
                    ? `${Math.max(nextRank.min - rating, 0)} Elo to ${nextRank.tier}`
                    : "Top tier reached"}
                </div>
              </div>
            </div>
          </div>

          <Link
            href={RANKING_HREF}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[13px] tracking-[-0.02em] text-(--app-text-soft) transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-(--app-text-strong) focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-(--app-focus-ring-offset) focus-visible:outline-none"
          >
            <Sparkles className="h-4 w-4 text-blue-300" strokeWidth={1.9} />
            Open ranking guide
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.9}
            />
          </Link>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span
              className="font-accent inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase"
              style={{
                color: nextRank?.color ?? currentRank.color,
                borderColor: `${nextRank?.color ?? currentRank.color}32`,
                background: getRankGradient(
                  `${currentRank.color}14`,
                  `${nextRank?.color ?? currentRank.color}14`,
                ),
              }}
            >
              {nextRank ? `To ${nextRank.tier}-tier` : "Max tier"}
            </span>

            <span className="text-[13px] font-semibold tracking-[-0.02em] text-(--app-text-strong)">
              {nextRank ? `${formatInteger(eloNeeded)} Elo needed` : "Top tier reached"}
            </span>
          </div>

          <div
            className="relative h-3 overflow-hidden rounded-full border"
            style={{
              borderColor: `${nextRank?.color ?? currentRank.color}24`,
              background:
                "linear-gradient(90deg, rgba(148,163,184,0.18) 0%, rgba(148,163,184,0.28) 100%)",
              boxShadow: "inset 0 1px 2px rgba(15,23,42,0.1)",
            }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${progressWidthPercent}%`,
                background: progressGradient,
                boxShadow: `0 0 0 1px ${currentRank.color}14, 0 6px 18px ${currentRank.color}22`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[12px] tracking-[0.18em] text-(--app-text-faint) uppercase">
            <span>{currentRank.tier}</span>
            <span>{nextRank?.tier ?? "S"}</span>
          </div>

          {hasGlobalRanking || hasRegionalRanking ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {hasGlobalRanking ? (
                <RankingCard
                  leading={
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border"
                      style={{
                        color: currentRank.color,
                        borderColor: `${currentRank.color}24`,
                        background: `${currentRank.color}14`,
                        boxShadow: `0 8px 22px ${currentRank.color}14`,
                      }}
                    >
                      <Globe2 className="h-4.5 w-4.5" strokeWidth={1.9} />
                    </span>
                  }
                  label="World Ranking"
                  description="Across all players"
                  value={`#${formatInteger(globalRank)}`}
                />
              ) : null}

              {hasRegionalRanking ? (
                <RankingCard
                  leading={
                    regionalCountryCode ? (
                      <CountryFlag
                        countryCode={regionalCountryCode}
                        countryName={country}
                        className="h-10 w-10"
                      />
                    ) : (
                      <span
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border"
                        style={{
                          color: currentRank.color,
                          borderColor: `${currentRank.color}24`,
                          background: `${currentRank.color}14`,
                          boxShadow: `0 8px 22px ${currentRank.color}14`,
                        }}
                      >
                        <MapPinned className="h-4.5 w-4.5" strokeWidth={1.9} />
                      </span>
                    )
                  }
                  label="Regional Ranking"
                  value={`#${formatInteger(regionalRank)}`}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </ProfileSection>
  );
}
