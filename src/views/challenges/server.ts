import "server-only";

import {
  getChallengeTopicLabels,
  type ChallengeListItem,
  type ChallengeTopicCount,
} from "@/entities/challenge";
import { getChallengeBySlug, getChallenges } from "@/entities/challenge/server";

export { getChallengeBySlug };

export type ChallengesPageData = {
  challenges: ChallengeListItem[];
  topics: ChallengeTopicCount[];
};

function buildChallengeTopics(challenges: ChallengeListItem[]): ChallengeTopicCount[] {
  const topicCounts = new Map<string, number>();

  for (const challenge of challenges) {
    for (const topic of getChallengeTopicLabels(challenge)) {
      topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    }
  }

  return Array.from(topicCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort(
      (left, right) => right.count - left.count || left.name.localeCompare(right.name),
    );
}

export async function getChallengesPageData(): Promise<ChallengesPageData> {
  const { challenges } = await getChallenges();

  return {
    challenges,
    topics: buildChallengeTopics(challenges),
  };
}
