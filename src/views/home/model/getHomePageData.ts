import "server-only";

import { getPublicMatchStats } from "@/entities/match/server";
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

const compactIntegerFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function toNonNegativeInteger(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function formatCompactInteger(value: number) {
  return compactIntegerFormatter.format(toNonNegativeInteger(value)).toUpperCase();
}

async function resolvePublicMatchStats() {
  try {
    return await getPublicMatchStats();
  } catch {
    return null;
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  const publicMatchStats = await resolvePublicMatchStats();

  const heroSnapshot: HeroSnapshot = publicMatchStats
    ? {
        ...HERO_SNAPSHOT,
        queueCount: toNonNegativeInteger(publicMatchStats.queuedPlayers),
      }
    : HERO_SNAPSHOT;

  const platformStats: PlatformStat[] = publicMatchStats
    ? [
        {
          id: "active-match-players",
          label: "Active Match Players",
          value: formatCompactInteger(publicMatchStats.activeMatchPlayers),
          badge: "Live",
          badgeTone: "info",
        },
        {
          id: "queued-players",
          label: "Players In Queue",
          value: formatCompactInteger(publicMatchStats.queuedPlayers),
          badge: "Live",
          badgeTone: "info",
        },
        PLATFORM_STATS[2],
      ]
    : PLATFORM_STATS;

  return {
    heroSnapshot,
    platformStats,
    arenaEdgeSnapshot: ARENA_EDGE_SNAPSHOT,
    leaderboardCtaSnapshot: LEADERBOARD_CTA_SNAPSHOT,
  };
}
