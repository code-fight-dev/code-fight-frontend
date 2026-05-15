import { LeaderboardPageView } from "@/views/leaderboard";
import { getLeaderboardViewData } from "@/views/leaderboard/server";

export default async function LeaderboardPage() {
  const page = await getLeaderboardViewData();

  return <LeaderboardPageView page={page} />;
}
