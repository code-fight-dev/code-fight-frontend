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
    <>
      <Hero snapshot={heroSnapshot} />
      <PlatformStats stats={platformStats} />
      <ArenaEdge snapshot={arenaEdgeSnapshot} />
      <LeaderboardCta snapshot={leaderboardCtaSnapshot} />
    </>
  );
}
