"use client";

import type { LeaderboardEntry, LeaderboardPage } from "@/entities/leaderboard";
import { useLeaderboardNavigation } from "@/features/leaderboard-navigation";
import { AmbientGrid } from "@/shared/ui/AmbientGrid";
import { Container } from "@/shared/ui/Container";
import { LeaderboardHero } from "@/widgets/leaderboard-hero";
import { LeaderboardPodium } from "@/widgets/leaderboard-podium";
import { LeaderboardRanking } from "@/widgets/leaderboard-ranking";

type Props = {
  page: LeaderboardPage;
  podiumItems: LeaderboardEntry[];
};

export function LeaderboardPageView({ page, podiumItems }: Props) {
  const {
    query,
    visibleItems,
    page: currentPage,
    totalPages,
    setQuery,
    goToEntry,
    goToPrevPage,
    goToNextPage,
    canGoPrevPage,
    canGoNextPage,
  } = useLeaderboardNavigation({
    items: page.items,
    viewerRank: page.viewerRank,
    pageSize: page.limit,
    pageOffset: page.offset,
    totalItems: page.total,
  });

  const viewerUserId = page.viewerRank?.userId ?? null;

  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden py-10 sm:py-14 lg:py-20">
      <AmbientGrid className="opacity-45" />

      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,12,24,0.14)_100%)]"
      />

      <Container className="relative">
        <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
          <div className="grid gap-7">
            <LeaderboardHero stats={page.stats} totalPlayers={page.total} />
            <LeaderboardPodium items={podiumItems} />
            <LeaderboardRanking
              items={visibleItems}
              viewerRank={page.viewerRank}
              viewerUserId={viewerUserId}
              query={query}
              totalCount={page.total}
              loadedCount={page.items.length}
              currentPage={currentPage}
              totalPages={totalPages}
              setQuery={setQuery}
              goToPrevPage={goToPrevPage}
              goToNextPage={goToNextPage}
              canGoPrevPage={canGoPrevPage}
              canGoNextPage={canGoNextPage}
              goToEntry={goToEntry}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
