import type { Metadata } from "next";
import { ChallengesPageView } from "@/views/challenges";
import { getChallengesPageData } from "@/views/challenges/server";

export const metadata: Metadata = {
  title: "Challenges | CodeFight",
  description: "Solo coding practice problems for the CodeFight platform.",
  alternates: {
    canonical: "/challenges",
  },
};

export default async function ChallengesPage() {
  const { challenges, topics } = await getChallengesPageData();
  const solvedCount = challenges.filter(
    (challenge) => challenge.progress === "solved",
  ).length;
  const activeCount = challenges.filter(
    (challenge) => challenge.progress === "in-progress",
  ).length;

  return (
    <ChallengesPageView
      challenges={challenges}
      topics={topics}
      solvedCount={solvedCount}
      activeCount={activeCount}
    />
  );
}
