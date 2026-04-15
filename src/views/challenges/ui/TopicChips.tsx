"use client";

import { ChevronDown } from "lucide-react";
import type { ChallengeTopicCount } from "@/entities/challenge";
import { cn } from "@/shared/lib/cn";

const COLLAPSED_TOPIC_COUNT = 14;

type Props = {
  topics: ChallengeTopicCount[];
  selectedTopics: string[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleTopic: (topic: string) => void;
};

export function TopicChips({
  topics,
  selectedTopics,
  expanded,
  onToggleExpanded,
  onToggleTopic,
}: Props) {
  const visibleTopics = expanded ? topics : topics.slice(0, COLLAPSED_TOPIC_COUNT);
  const hiddenCount = Math.max(topics.length - visibleTopics.length, 0);

  return (
    <section className="challenge-panel-soft rounded-lg p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-(--app-text-strong)">Topics</h2>
          <p className="mt-1 text-[13px] leading-6 text-(--app-text-muted)">
            Pick multiple patterns to narrow the practice set.
          </p>
        </div>

        <div className="text-[13px] text-(--app-text-faint)">
          {topics.length} topics from the starter catalog
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {visibleTopics.map((topic) => {
          const isSelected = selectedTopics.includes(topic.name);

          return (
            <button
              key={topic.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggleTopic(topic.name)}
              className={cn(
                "challenge-focus-ring inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors",
                isSelected
                  ? "border-(--app-option-active-border) bg-(--app-option-active-bg) text-(--app-text-strong)"
                  : "border-(--app-option-border) bg-(--app-option-bg) text-(--app-text-muted) hover:border-(--app-control-secondary-hover-border) hover:bg-(--app-control-secondary-hover-bg) hover:text-(--app-text-strong)",
              )}
            >
              <span>{topic.name}</span>
              <span
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[11px]",
                  isSelected
                    ? "border-(--app-option-active-border) bg-(--app-option-active-bg) text-(--app-text-strong)"
                    : "border-(--app-option-border) bg-(--app-option-bg) text-(--app-text-faint)",
                )}
              >
                {topic.count}
              </span>
            </button>
          );
        })}

        {hiddenCount > 0 || expanded ? (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="challenge-focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) px-3 text-[13px] font-semibold text-(--app-text-muted) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong)"
          >
            {expanded ? "Show fewer" : `Show ${hiddenCount} more`}
            <ChevronDown
              aria-hidden
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            />
          </button>
        ) : null}
      </div>
    </section>
  );
}
