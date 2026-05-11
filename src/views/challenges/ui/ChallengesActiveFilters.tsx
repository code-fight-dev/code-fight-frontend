import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  PROGRAMMING_LANGUAGE_BY_ID,
  type ChallengeDifficulty,
} from "@/entities/challenge";
import type { ChallengeLanguageFilter } from "../model/filters";

type Props = {
  query: string;
  selectedDifficulties: ChallengeDifficulty[];
  selectedTopics: string[];
  selectedLanguage: ChallengeLanguageFilter;
  onRemoveQuery: () => void;
  onRemoveDifficulty: (difficulty: ChallengeDifficulty) => void;
  onRemoveTopic: (topic: string) => void;
  onResetLanguage: () => void;
};

function ActiveFilterButton({
  children,
  ariaLabel,
  onRemove,
}: {
  children: ReactNode;
  ariaLabel: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onRemove}
      className="challenge-focus-ring inline-flex h-8 items-center gap-2 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) px-2.5 text-[12px] font-semibold text-(--app-text-muted) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong)"
    >
      {children}
      <X aria-hidden className="h-3.5 w-3.5" />
    </button>
  );
}

export function ChallengesActiveFilters({
  query,
  selectedDifficulties,
  selectedTopics,
  selectedLanguage,
  onRemoveQuery,
  onRemoveDifficulty,
  onRemoveTopic,
  onResetLanguage,
}: Props) {
  return (
    <div className="challenge-panel-muted flex flex-wrap items-center gap-2 rounded-lg p-3">
      <span className="text-[12px] font-semibold text-(--app-text-faint)">
        Active filters
      </span>
      {query.trim() ? (
        <ActiveFilterButton
          ariaLabel={`Remove filter search ${query.trim()}`}
          onRemove={onRemoveQuery}
        >
          Search: {query.trim()}
        </ActiveFilterButton>
      ) : null}
      {selectedDifficulties.map((difficulty) => (
        <ActiveFilterButton
          key={difficulty}
          ariaLabel={`Remove filter ${difficulty}`}
          onRemove={() => onRemoveDifficulty(difficulty)}
        >
          {difficulty}
        </ActiveFilterButton>
      ))}
      {selectedTopics.map((topic) => (
        <ActiveFilterButton
          key={topic}
          ariaLabel={`Remove filter ${topic}`}
          onRemove={() => onRemoveTopic(topic)}
        >
          {topic}
        </ActiveFilterButton>
      ))}
      {selectedLanguage !== "all" ? (
        <ActiveFilterButton
          ariaLabel={`Remove filter ${PROGRAMMING_LANGUAGE_BY_ID[selectedLanguage].label}`}
          onRemove={onResetLanguage}
        >
          {PROGRAMMING_LANGUAGE_BY_ID[selectedLanguage].label}
        </ActiveFilterButton>
      ) : null}
    </div>
  );
}
