"use client";

import { Search, X } from "lucide-react";
import type { ChallengeDifficulty } from "@/entities/challenge";
import { PROGRAMMING_LANGUAGES } from "@/entities/challenge";
import { cn } from "@/shared/lib/cn";
import { Select, type SelectOption } from "@/shared/ui/Select";
import {
  CHALLENGE_SORT_OPTIONS,
  DIFFICULTY_OPTIONS,
  type ChallengeLanguageFilter,
  type ChallengeSort,
} from "../model/filters";

type Props = {
  query: string;
  selectedDifficulties: ChallengeDifficulty[];
  selectedLanguage: ChallengeLanguageFilter;
  sort: ChallengeSort;
  activeFilterCount: number;
  onQueryChange: (query: string) => void;
  onToggleDifficulty: (difficulty: ChallengeDifficulty) => void;
  onLanguageChange: (language: ChallengeLanguageFilter) => void;
  onSortChange: (sort: ChallengeSort) => void;
  onClearFilters: () => void;
};

const LANGUAGE_FILTER_OPTIONS: SelectOption<ChallengeLanguageFilter>[] = [
  { value: "all", label: "All languages" },
  ...PROGRAMMING_LANGUAGES.map((language) => ({
    value: language.id,
    label: language.label,
  })),
];

export function ChallengeFilters({
  query,
  selectedDifficulties,
  selectedLanguage,
  sort,
  activeFilterCount,
  onQueryChange,
  onToggleDifficulty,
  onLanguageChange,
  onSortChange,
  onClearFilters,
}: Props) {
  return (
    <section className="challenge-panel-soft rounded-lg p-4 sm:p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="group relative block">
          <span className="sr-only">Search challenges</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-(--app-input-icon) transition-colors group-focus-within:text-blue-400"
          />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by title, tag, or pattern"
            className="challenge-control h-11 w-full rounded-lg pr-3.5 pl-10 text-[14px] transition-colors outline-none"
          />
        </label>

        <div>
          <span className="sr-only">Language</span>
          <Select
            aria-label="Language"
            value={selectedLanguage}
            options={LANGUAGE_FILTER_OPTIONS}
            onValueChange={onLanguageChange}
            surface="challenge"
            controlSize="md"
            className="xl:w-45"
          />
        </div>

        <div>
          <span className="sr-only">Sort challenges</span>
          <Select
            aria-label="Sort challenges"
            value={sort}
            options={CHALLENGE_SORT_OPTIONS}
            onValueChange={onSortChange}
            surface="challenge"
            controlSize="md"
            className="xl:w-45"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map((difficulty) => {
            const isSelected = selectedDifficulties.includes(difficulty);

            return (
              <button
                key={difficulty}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleDifficulty(difficulty)}
                className={cn(
                  "challenge-focus-ring h-9 rounded-lg border px-3 text-[13px] font-semibold transition-colors",
                  isSelected
                    ? "border-(--app-option-active-border) bg-(--app-option-active-bg) text-(--app-text-strong)"
                    : "border-(--app-option-border) bg-(--app-option-bg) text-(--app-text-muted) hover:border-(--app-control-secondary-hover-border) hover:text-(--app-text-strong)",
                )}
              >
                {difficulty}
              </button>
            );
          })}
        </div>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="challenge-focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) px-3 text-[13px] font-semibold text-(--app-text-muted) transition-colors hover:border-rose-400/35 hover:bg-rose-400/10 hover:text-rose-500"
          >
            <X aria-hidden className="h-4 w-4" />
            Clear filters
          </button>
        ) : null}
      </div>
    </section>
  );
}
