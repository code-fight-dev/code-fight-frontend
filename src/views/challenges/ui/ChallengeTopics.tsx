import type { ChallengeTopicSource } from "@/entities/challenge";
import { getChallengeTopicLabels } from "@/entities/challenge";
import { cn } from "@/shared/lib/cn";
import { ChallengeTag } from "./ChallengeTag";

type Props = {
  challenge: ChallengeTopicSource;
  className?: string;
  limit?: number;
};

export function ChallengeTopics({ challenge, className, limit }: Props) {
  const topics = getChallengeTopicLabels(challenge);
  const visibleTopics = typeof limit === "number" ? topics.slice(0, limit) : topics;
  const hiddenCount = Math.max(topics.length - visibleTopics.length, 0);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visibleTopics.map((topic) => (
        <ChallengeTag key={topic}>{topic}</ChallengeTag>
      ))}

      {hiddenCount > 0 ? (
        <span className="challenge-panel-muted inline-flex h-7 items-center rounded-md px-2.5 text-[12px] text-(--app-text-faint)">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}
