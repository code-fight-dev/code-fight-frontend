import type { Metadata } from "next";
import { ChallengesPageView } from "@/views/challenges";
import { getChallengeTopics, getChallenges } from "@/views/challenges/server";

export const metadata: Metadata = {
  title: "Challenges | CodeFight",
  description: "Solo coding practice problems for the CodeFight platform.",
};

export default async function ChallengesPage() {
  const [challenges, topics] = await Promise.all([getChallenges(), getChallengeTopics()]);

  return <ChallengesPageView challenges={challenges} topics={topics} />;
}
