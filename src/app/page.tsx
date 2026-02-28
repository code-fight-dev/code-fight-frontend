import { AmbientGrid } from "@/shared/ui/AmbientGrid";
import { ArenaEdge, getArenaEdgeSnapshot } from "@/widgets/arena-edge";
import { getHeroSnapshot, Hero } from "@/widgets/hero";
import { getLeaderboardCtaSnapshot, LeaderboardCta } from "@/widgets/leaderboard-cta";
import { getPlatformStatsSnapshot, PlatformStats } from "@/widgets/platform-stats";

export const revalidate = 30;

export default async function Home() {
  const [heroSnapshot, platformStats, arenaEdgeSnapshot, leaderboardCtaSnapshot] =
    await Promise.all([
      getHeroSnapshot(),
      getPlatformStatsSnapshot(),
      getArenaEdgeSnapshot(),
      getLeaderboardCtaSnapshot(),
    ]);

  return (
    <div className="relative overflow-hidden">
      <AmbientGrid className="mask-[radial-gradient(circle_at_top,black,transparent_94%)] opacity-80" />

      <div className="relative z-10">
        <Hero snapshot={heroSnapshot} />
        <PlatformStats stats={platformStats} />
        <ArenaEdge snapshot={arenaEdgeSnapshot} />
        <LeaderboardCta snapshot={leaderboardCtaSnapshot} />
      </div>
    </div>
  );
}
