import { CHALLENGE_CATALOG } from "../model/mockChallenges";
import { getChallengeTopicLabels } from "../model/topics";
import type { Challenge, ChallengeListItem, ChallengeTopicCount } from "../model/types";

function toListItem(challenge: Challenge): ChallengeListItem {
  return {
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    difficulty: challenge.difficulty,
    summary: challenge.summary,
    tags: challenge.tags,
    category: challenge.category,
    kind: challenge.kind,
    supportedLanguages: challenge.supportedLanguages,
    acceptanceRate: challenge.acceptanceRate,
    estimatedMinutes: challenge.estimatedMinutes,
    attempts: challenge.attempts,
    popularity: challenge.popularity,
    createdAt: challenge.createdAt,
    progress: challenge.progress,
  };
}

export async function getChallenges(): Promise<ChallengeListItem[]> {
  return CHALLENGE_CATALOG.map(toListItem);
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  return CHALLENGE_CATALOG.find((challenge) => challenge.slug === slug) ?? null;
}

export async function getChallengeSlugs(): Promise<string[]> {
  return CHALLENGE_CATALOG.map((challenge) => challenge.slug);
}

export async function getChallengeTopics(): Promise<ChallengeTopicCount[]> {
  const topicCounts = new Map<string, number>();

  for (const challenge of CHALLENGE_CATALOG) {
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
