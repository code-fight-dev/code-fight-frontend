"use client";

import type { LeaderboardPage } from "@/entities/leaderboard";
import { useLeaderboardNavigation } from "@/features/leaderboard-navigation";
import { AmbientGrid } from "@/shared/ui/AmbientGrid";
import { Container } from "@/shared/ui/Container";
import { LeaderboardHero } from "@/widgets/leaderboard-hero";
import { LeaderboardPodium } from "@/widgets/leaderboard-podium";
import { LeaderboardRanking } from "@/widgets/leaderboard-ranking";

type Props = {
  page: LeaderboardPage;
};

export function LeaderboardPageView({ page }: Props) {
  const {
    query,
    pageItems,
    page: currentPage,
    totalPages,
    filteredCount,
    setQuery,
    goToEntry,
    goToPrevPage,
    goToNextPage,
  } = useLeaderboardNavigation({
    items: page.items,
    pageSize: 10,
  });

  const viewerUserId = page.viewerRank?.userId ?? null;

  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden py-10 sm:py-14 lg:py-20">
      <AmbientGrid className="opacity-45" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,12,24,0.14)_100%)]"
      />

      <Container className="relative">
        <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
          <div className="grid gap-7">
            <LeaderboardHero />
            <LeaderboardPodium items={page.items} />
            <LeaderboardRanking
              items={pageItems}
              viewerRank={page.viewerRank}
              viewerUserId={viewerUserId}
              query={query}
              filteredCount={filteredCount}
              loadedCount={page.items.length}
              currentPage={currentPage}
              totalPages={totalPages}
              setQuery={setQuery}
              goToPrevPage={goToPrevPage}
              goToNextPage={goToNextPage}
              goToEntry={goToEntry}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
