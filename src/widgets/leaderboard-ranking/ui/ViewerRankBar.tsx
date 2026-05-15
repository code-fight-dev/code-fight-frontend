import { Trophy } from "lucide-react";
import {
  formatInteger,
  formatWinRate,
  LeaderboardAvatar,
  TierBadge,
} from "@/entities/leaderboard";
import type { LeaderboardEntry } from "@/entities/leaderboard";
import { LeaderboardJumpToMeButton } from "@/features/leaderboard-focus";

type Props = {
  entry: LeaderboardEntry;
  onJumpToMe: () => void;
};

export function ViewerRankBar({ entry, onJumpToMe }: Props) {
  return (
    <div className="relative overflow-x-auto rounded-2xl border border-slate-300/35 bg-white/3 px-4 py-3 shadow-[0_0_0_1px_rgba(148,163,184,0.22),0_12px_28px_rgba(148,163,184,0.12)] sm:pr-36">
      <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
        <Trophy className="h-3.5 w-3.5 text-slate-200" strokeWidth={2} />
        Your Rank
      </div>

      <div className="mt-2 flex min-w-max items-center gap-3">
        <span className="text-[16px] font-semibold tracking-[-0.03em] whitespace-nowrap text-(--app-text-strong)">
          #{formatInteger(entry.rank)}
        </span>

        <TierBadge entry={entry} />

        <LeaderboardAvatar
          avatarUrl={entry.avatarUrl}
          username={entry.username}
          imageSize={32}
          className="h-8 w-8 rounded-lg text-[12px]"
        />

        <span className="text-[14px] whitespace-nowrap text-(--app-text-soft)">
          {entry.displayName}
        </span>

        <span className="text-[13px] whitespace-nowrap text-(--app-text-muted)">
          {formatInteger(entry.rating)} rating - {formatWinRate(entry.winRate)} winrate
        </span>
      </div>

      <LeaderboardJumpToMeButton onClick={onJumpToMe} />
    </div>
  );
}
