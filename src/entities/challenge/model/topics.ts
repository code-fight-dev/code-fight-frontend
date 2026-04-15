import type { ChallengeKind } from "./types";

export type ChallengeTopicSource = Readonly<{
  kind: ChallengeKind;
  tags: readonly string[];
}>;

export function getChallengeTopicLabels(challenge: ChallengeTopicSource) {
  const topicLabels =
    challenge.kind === "sql" ? ["SQL", ...challenge.tags] : challenge.tags;

  return Array.from(new Set(topicLabels));
}
