import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatInteger } from "@/entities/leaderboard";

type Props = {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function LeaderboardPaginationControls({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: Props) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-[13px] text-(--app-text-muted)">
        Page {formatInteger(currentPage)} / {formatInteger(totalPages)}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-(--app-text-soft) transition-colors enabled:hover:border-blue-400/25 enabled:hover:bg-blue-500/10 enabled:hover:text-(--app-text-strong) disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          Prev
        </button>

        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-(--app-text-soft) transition-colors enabled:hover:border-blue-400/25 enabled:hover:bg-blue-500/10 enabled:hover:text-(--app-text-strong) disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
