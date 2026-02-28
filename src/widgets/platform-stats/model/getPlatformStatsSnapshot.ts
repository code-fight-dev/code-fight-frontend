import "server-only";

export type PlatformStat = {
  id: string;
  label: string;
  value: string;
  badge: string;
  badgeTone: "success" | "info";
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

export async function getPlatformStatsSnapshot(): Promise<PlatformStat[]> {
  // Later this should read from an aggregated stats source, not compute
  // expensive counters on every page render.
  return PLATFORM_STATS;
}
