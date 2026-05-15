"use client";

import { formatInteger } from "@/entities/leaderboard";
import type { LeaderboardEntry } from "@/entities/leaderboard";
import { useLeaderboardEntryFocus } from "@/features/leaderboard-focus";
import {
  LeaderboardPaginationControls,
  LeaderboardSearchInput,
} from "@/features/leaderboard-navigation";
import { LeaderboardDesktopTable } from "./LeaderboardDesktopTable";
import { LeaderboardMobileRows } from "./LeaderboardMobileRows";
import { ViewerRankBar } from "./ViewerRankBar";

type Props = {
  items: LeaderboardEntry[];
  viewerRank?: LeaderboardEntry;
  viewerUserId: string | null;
  query: string;
  filteredCount: number;
  loadedCount: number;
  currentPage: number;
  totalPages: number;
  setQuery: (value: string) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  goToEntry: (userId: string) => boolean;
};

export function LeaderboardRanking({
  items,
  viewerRank,
  viewerUserId,
  query,
  filteredCount,
  loadedCount,
  currentPage,
  totalPages,
  setQuery,
  goToPrevPage,
  goToNextPage,
  goToEntry,
}: Props) {
  const { focusedUserId, handleJumpToMe } = useLeaderboardEntryFocus({
    goToEntry,
    viewerUserId,
  });

  return (
    <section className="relative px-1 sm:px-2 lg:px-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[1.25rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
            Ranking
          </h2>

          <p className="mt-1 text-[13px] text-(--app-text-muted)">
            Top {formatInteger(loadedCount)} loaded players · Showing{" "}
            {formatInteger(items.length)} of {formatInteger(filteredCount)}
          </p>
        </div>

        <LeaderboardSearchInput query={query} onQueryChange={setQuery} />
      </div>

      <div className="mt-4">
        <LeaderboardDesktopTable
          items={items}
          focusedUserId={focusedUserId}
          viewerUserId={viewerUserId}
        />

        <LeaderboardMobileRows
          items={items}
          focusedUserId={focusedUserId}
          viewerUserId={viewerUserId}
        />
      </div>

      {viewerRank ? (
        <div className="mt-4">
          <ViewerRankBar entry={viewerRank} onJumpToMe={handleJumpToMe} />
        </div>
      ) : null}

      <LeaderboardPaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
      />
    </section>
  );
}
