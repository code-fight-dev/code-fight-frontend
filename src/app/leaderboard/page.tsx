import type { Metadata } from "next";
import {
  getLeaderboardViewData,
  LeaderboardPageView,
  parseLeaderboardViewQuery,
} from "@/views/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard | CodeFight",
  description:
    "Top CodeFight competitors ranked by performance across coding challenges and arena battles.",
  alternates: {
    canonical: "/leaderboard",
  },
};

export default async function LeaderboardPage({
  searchParams,
}: PageProps<"/leaderboard">) {
  const query = parseLeaderboardViewQuery(await searchParams);

  const leaderboard = await getLeaderboardViewData({
    mode: query.mode,
    page: query.page,
    pageSize: query.pageSize,
  });

  return (
    <LeaderboardPageView page={leaderboard.page} podiumItems={leaderboard.podiumItems} />
  );
}
