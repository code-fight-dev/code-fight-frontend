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
  totalCount: number;
  loadedCount: number;
  currentPage: number;
  totalPages: number;
  setQuery: (value: string) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  canGoPrevPage: boolean;
  canGoNextPage: boolean;
  goToEntry: (userId: string) => boolean;
};

export function LeaderboardRanking({
  items,
  viewerRank,
  viewerUserId,
  query,
  totalCount,
  loadedCount,
  currentPage,
  totalPages,
  setQuery,
  goToPrevPage,
  goToNextPage,
  canGoPrevPage,
  canGoNextPage,
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
            Total {formatInteger(totalCount)} players | Showing{" "}
            {formatInteger(items.length)} of {formatInteger(loadedCount)} loaded this page
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
        canGoPrevPage={canGoPrevPage}
        canGoNextPage={canGoNextPage}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
      />
    </section>
  );
}
