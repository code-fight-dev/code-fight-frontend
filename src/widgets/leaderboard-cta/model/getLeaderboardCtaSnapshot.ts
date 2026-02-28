import "server-only";
import type { LeaderboardCtaSnapshot } from "./types";

const LEADERBOARD_CTA_SNAPSHOT: LeaderboardCtaSnapshot = {
  title: "Ready to climb the world leaderboard?",
  description:
    "Join over 120,000 developers competing daily. Start your ranking journey today.",
  actionLabel: "Start Rating Game",
  actionHref: "/arena",
};

export async function getLeaderboardCtaSnapshot(): Promise<LeaderboardCtaSnapshot> {
  return LEADERBOARD_CTA_SNAPSHOT;
}
