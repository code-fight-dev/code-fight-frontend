import Link from "next/link";
import { ChevronLeft, Flag } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { toReadableStatus, toShortID } from "../model/presentation";

type Props = {
  matchId: string;
  opponentId: string;
  status: string;
  isSurrendering: boolean;
  onSurrenderClick: () => void;
};

export function ArenaRoomHeaderBar({
  matchId,
  opponentId,
  status,
  isSurrendering,
  onSurrenderClick,
}: Props) {
  const canSurrender = status === "running";

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <Link
        href="/arena"
        className="challenge-focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) px-3 text-[13px] font-semibold text-(--app-text-muted) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong)"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to arena
      </Link>

      <div className="flex flex-wrap items-center justify-end gap-2 text-[12px]">
        <span className="challenge-panel-muted rounded-md px-2.5 py-1.5 text-(--app-text-soft)">
          Match #{toShortID(matchId)}
        </span>
        <span className="challenge-panel-muted rounded-md px-2.5 py-1.5 text-(--app-text-soft)">
          Opponent {toShortID(opponentId)}
        </span>
        <span className="challenge-panel-muted rounded-md px-2.5 py-1.5 text-(--app-text-soft)">
          {toReadableStatus(status)}
        </span>
        <button
          type="button"
          disabled={!canSurrender || isSurrendering}
          onClick={onSurrenderClick}
          className={cn(
            "challenge-focus-ring inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-colors",
            canSurrender
              ? "border-red-400/25 bg-red-500/8 text-red-200 hover:border-red-300/45 hover:bg-red-500/14 hover:text-red-100"
              : "border-(--app-option-border) bg-(--app-option-bg) text-(--app-text-faint)",
            "disabled:cursor-not-allowed disabled:opacity-55",
          )}
        >
          <Flag className="h-4 w-4" />
          {isSurrendering ? "Surrendering" : "Surrender"}
        </button>
      </div>
    </div>
  );
}
