"use client";

import Link from "next/link";
import type { ReplayPlayer } from "@/features/match-replay";
import { cn } from "@/shared/lib/cn";

type Props = {
  matchId: string;
  status: string;
  players: ReplayPlayer[];
  activePlayerId: string | null;
  onSelectPlayer: (playerId: string) => void;
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function ArenaReplayHeaderBar({
  matchId,
  status,
  players,
  activePlayerId,
  onSelectPlayer,
}: Props) {
  return (
    <div className="mb-3 space-y-3 rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(13,20,37,0.94),rgba(8,12,24,0.92))] p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/arena"
          className="challenge-focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) px-3 text-[13px] font-semibold text-(--app-text-muted) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong)"
        >
          Back to arena
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="inline-flex items-center rounded-full border border-cyan-300/22 bg-cyan-300/10 px-3 py-1 text-cyan-100">
            Replay
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-(--app-text-soft)">
            Match {matchId.slice(0, 8)}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-(--app-text-soft) capitalize">
            {formatStatus(status)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {players.map((player) => (
          <button
            key={player.id}
            type="button"
            onClick={() => onSelectPlayer(player.id)}
            className={cn(
              "challenge-focus-ring inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-[12px] font-medium tracking-[-0.02em] transition-all",
              activePlayerId === player.id
                ? "border-blue-400/35 bg-blue-500/12 text-(--app-text-strong)"
                : "border-white/10 bg-white/6 text-(--app-text-soft) hover:border-blue-400/25 hover:bg-blue-500/10 hover:text-(--app-text-strong)",
            )}
          >
            {player.displayName}
          </button>
        ))}
      </div>
    </div>
  );
}
