import { AmbientGrid } from "@/shared/ui/AmbientGrid";
import { ArenaEdge } from "@/widgets/arena-edge";
import { Hero } from "@/widgets/hero";
import { LeaderboardCta } from "@/widgets/leaderboard-cta";
import { PlatformStats } from "@/widgets/platform-stats";
import type { HomePageData } from "../model/getHomePageData";

type Props = {
  data: HomePageData;
};

export function HomePage({ data }: Props) {
  return (
    <div className="relative overflow-hidden">
      <AmbientGrid className="mask-[radial-gradient(circle_at_top,black,transparent_94%)] opacity-80" />

      <div className="relative z-10">
        <Hero snapshot={data.heroSnapshot} />
        <PlatformStats stats={data.platformStats} />
        <ArenaEdge snapshot={data.arenaEdgeSnapshot} />
        <LeaderboardCta snapshot={data.leaderboardCtaSnapshot} />
      </div>
    </div>
  );
}
