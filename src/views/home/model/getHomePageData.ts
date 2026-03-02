import "server-only";

import type { ArenaEdgeSnapshot } from "@/widgets/arena-edge";
import type { HeroSnapshot } from "@/widgets/hero";
import type { LeaderboardCtaSnapshot } from "@/widgets/leaderboard-cta";
import type { PlatformStat } from "@/widgets/platform-stats";

export type HomePageData = {
  heroSnapshot: HeroSnapshot;
  platformStats: PlatformStat[];
  arenaEdgeSnapshot: ArenaEdgeSnapshot;
  leaderboardCtaSnapshot: LeaderboardCtaSnapshot;
};

const HERO_SNAPSHOT: HeroSnapshot = {
  liveLabel: "Live Season",
  queueCount: 12438,
  featuredDevelopers: [
    { id: "ava", initials: "AV", tintClassName: "from-[#f2d6c5] to-[#8f6a5f]" },
    { id: "mk", initials: "MK", tintClassName: "from-[#dadfeb] to-[#6f7fa1]" },
    { id: "ln", initials: "LN", tintClassName: "from-[#f0e0d2] to-[#9f8074]" },
  ],
};

const PLATFORM_STATS: PlatformStat[] = [
  {
    id: "active-players",
    label: "Active Players",
    value: "120K+",
    badge: "+12%",
    badgeTone: "success",
  },
  {
    id: "matches-hosted",
    label: "Matches Hosted",
    value: "2.5M",
    badge: "+25%",
    badgeTone: "success",
  },
  {
    id: "avg-queue-time",
    label: "Avg. Queue Time",
    value: "< 30s",
    badge: "Optimal",
    badgeTone: "info",
  },
];

const ARENA_EDGE_SNAPSHOT: ArenaEdgeSnapshot = {
  eyebrow: "The Arena Edge",
  title: "Engineered for Competition",
  description:
    "Experience the most advanced competitive coding environment ever built, designed by pros for pros.",
  cards: [
    {
      id: "real-time-coding",
      title: "Real-time Coding",
      description:
        "Synchronized IDE with sub-millisecond latency. Watch your opponent's cursor in real-time as you race to the solution.",
      icon: "realtime",
    },
    {
      id: "elo-system",
      title: "Elo System",
      description:
        "Advanced matchmaking algorithm derived from Chess grandmaster standards, ensuring fair play and accurate representation.",
      icon: "elo",
    },
    {
      id: "replay-system",
      title: "Replay System",
      description:
        "Analyze every keystroke with our comprehensive match replay engine and heat-map analysis tools.",
      icon: "replay",
    },
  ],
};

const LEADERBOARD_CTA_SNAPSHOT: LeaderboardCtaSnapshot = {
  title: "Ready to climb the world leaderboard?",
  description:
    "Join over 120,000 developers competing daily. Start your ranking journey today.",
  actionLabel: "Start Rating Game",
  actionHref: "/arena",
};

export async function getHomePageData(): Promise<HomePageData> {
  return {
    heroSnapshot: HERO_SNAPSHOT,
    platformStats: PLATFORM_STATS,
    arenaEdgeSnapshot: ARENA_EDGE_SNAPSHOT,
    leaderboardCtaSnapshot: LEADERBOARD_CTA_SNAPSHOT,
  };
}
