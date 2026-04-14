"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useDeferredValue, useMemo, useState } from "react";
import { Swords, Target, X } from "lucide-react";
import {
  PROGRAMMING_LANGUAGE_BY_ID,
  type ChallengeDifficulty,
  type ChallengeListItem,
  type ChallengeTopicCount,
} from "@/entities/challenge";
import { Container } from "@/shared/ui/Container";
import {
  filterAndSortChallenges,
  getActiveFilterCount,
  type ChallengeFilterState,
  type ChallengeLanguageFilter,
  type ChallengeSort,
} from "../model/filters";
import { ChallengeFilters } from "./ChallengeFilters";
import { ChallengeList } from "./ChallengeList";
import { TopicChips } from "./TopicChips";

type Props = {
  challenges: ChallengeListItem[];
  topics: ChallengeTopicCount[];
};

function toggleItem<T>(items: T[], item: T) {
  if (items.includes(item)) {
    return items.filter((currentItem) => currentItem !== item);
  }

  return [...items, item];
}

function ActiveFilterButton({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="challenge-focus-ring inline-flex h-8 items-center gap-2 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) px-2.5 text-[12px] font-semibold text-(--app-text-muted) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong)"
    >
      {children}
      <X aria-hidden className="h-3.5 w-3.5" />
    </button>
  );
}

export function ChallengesPageView({ challenges, topics }: Props) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedDifficulties, setSelectedDifficulties] = useState<ChallengeDifficulty[]>(
    [],
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] =
    useState<ChallengeLanguageFilter>("all");
  const [sort, setSort] = useState<ChallengeSort>("recommended");
  const [topicsExpanded, setTopicsExpanded] = useState(false);

  const filters = useMemo<ChallengeFilterState>(
    () => ({
      query: deferredQuery,
      difficulties: selectedDifficulties,
      topics: selectedTopics,
      language: selectedLanguage,
      sort,
    }),
    [deferredQuery, selectedDifficulties, selectedLanguage, selectedTopics, sort],
  );

  const filteredChallenges = useMemo(
    () => filterAndSortChallenges(challenges, filters),
    [challenges, filters],
  );

  const activeFilterCount = getActiveFilterCount({
    ...filters,
    query,
  });

  const completedCount = challenges.filter(
    (challenge) => challenge.progress === "solved",
  ).length;
  const activeCount = challenges.filter(
    (challenge) => challenge.progress === "in-progress",
  ).length;

  function clearFilters() {
    setQuery("");
    setSelectedDifficulties([]);
    setSelectedTopics([]);
    setSelectedLanguage("all");
  }

  return (
    <section className="challenge-page relative overflow-hidden py-8 sm:py-10 lg:py-12">
      <div
        aria-hidden
        className="challenge-grid-layer pointer-events-none absolute inset-0 opacity-35"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,12,24,0.12)_100%)]"
      />

      <Container className="relative">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div className="max-w-3xl">
            <p className="challenge-kicker font-accent text-[13px] font-semibold text-blue-300">
              Solo practice
            </p>
            <h1 className="mt-3 text-[2.45rem] leading-none font-semibold text-(--app-text-strong) sm:text-[3.25rem]">
              Challenges
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-(--app-text-muted) sm:text-[16px]">
              Browse focused programming problems, study the prompt, and prepare a
              solution before stepping into live duels.
            </p>
          </div>

          <div className="challenge-panel-soft grid gap-2 rounded-lg p-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Link
              href="/arena"
              className="challenge-focus-ring group flex items-center gap-3 rounded-md border border-(--app-option-border) bg-(--app-option-bg) p-3 transition-colors hover:border-(--app-control-secondary-hover-border) hover:bg-(--app-control-secondary-hover-bg)"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rose-400/22 bg-rose-400/10 text-rose-400">
                <Swords aria-hidden className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-(--app-text-strong)">
                  Arena
                </span>
                <span className="text-[12px] text-(--app-text-faint)">
                  PvP matchmaking
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-3 rounded-md border border-(--app-option-active-border) bg-(--app-option-active-bg) p-3">
              <span className="challenge-accent-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-(--app-option-active-border) bg-(--app-option-active-bg) text-blue-300">
                <Target aria-hidden className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-(--app-text-strong)">
                  Challenges
                </span>
                <span className="text-[12px] text-(--app-text-muted)">Solo practice</span>
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            ["Catalog", `${challenges.length} problems`],
            ["Solved", `${completedCount} completed`],
            ["Active", `${activeCount} in progress`],
          ].map(([label, value]) => (
            <div key={label} className="challenge-panel-muted rounded-lg px-4 py-3">
              <dt className="text-[12px] text-(--app-text-faint)">{label}</dt>
              <dd className="mt-1 text-[18px] font-semibold text-(--app-text-strong)">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-4">
          <ChallengeFilters
            query={query}
            selectedDifficulties={selectedDifficulties}
            selectedLanguage={selectedLanguage}
            sort={sort}
            activeFilterCount={activeFilterCount}
            onQueryChange={setQuery}
            onToggleDifficulty={(difficulty) =>
              setSelectedDifficulties((currentDifficulties) =>
                toggleItem(currentDifficulties, difficulty),
              )
            }
            onLanguageChange={setSelectedLanguage}
            onSortChange={setSort}
            onClearFilters={clearFilters}
          />

          <TopicChips
            topics={topics}
            selectedTopics={selectedTopics}
            expanded={topicsExpanded}
            onToggleExpanded={() => setTopicsExpanded((expanded) => !expanded)}
            onToggleTopic={(topic) =>
              setSelectedTopics((currentTopics) => toggleItem(currentTopics, topic))
            }
          />

          {activeFilterCount > 0 ? (
            <div className="challenge-panel-muted flex flex-wrap items-center gap-2 rounded-lg p-3">
              <span className="text-[12px] font-semibold text-(--app-text-faint)">
                Active filters
              </span>
              {query.trim() ? (
                <ActiveFilterButton onRemove={() => setQuery("")}>
                  Search: {query.trim()}
                </ActiveFilterButton>
              ) : null}
              {selectedDifficulties.map((difficulty) => (
                <ActiveFilterButton
                  key={difficulty}
                  onRemove={() =>
                    setSelectedDifficulties((currentDifficulties) =>
                      currentDifficulties.filter(
                        (currentDifficulty) => currentDifficulty !== difficulty,
                      ),
                    )
                  }
                >
                  {difficulty}
                </ActiveFilterButton>
              ))}
              {selectedTopics.map((topic) => (
                <ActiveFilterButton
                  key={topic}
                  onRemove={() =>
                    setSelectedTopics((currentTopics) =>
                      currentTopics.filter((currentTopic) => currentTopic !== topic),
                    )
                  }
                >
                  {topic}
                </ActiveFilterButton>
              ))}
              {selectedLanguage !== "all" ? (
                <ActiveFilterButton onRemove={() => setSelectedLanguage("all")}>
                  {PROGRAMMING_LANGUAGE_BY_ID[selectedLanguage].label}
                </ActiveFilterButton>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-(--app-text-strong)">
                Problem set
              </h2>
              <p className="mt-1 text-[13px] text-(--app-text-faint)">
                {filteredChallenges.length} of {challenges.length} challenges
              </p>
            </div>
            <p className="text-[13px] text-(--app-text-faint)">
              Sorted by your current practice plan.
            </p>
          </div>

          <ChallengeList challenges={filteredChallenges} />
        </div>
      </Container>
    </section>
  );
}
