"use client";

import type { ChallengeListItem, ChallengeTopicCount } from "@/entities/challenge";
import { Container } from "@/shared/ui/Container";
import { useChallengesPageState } from "../model/useChallengesPageState";
import { ChallengesActiveFilters } from "./ChallengesActiveFilters";
import { ChallengeFilters } from "./ChallengeFilters";
import { ChallengeList } from "./ChallengeList";
import { ChallengesPageHero } from "./ChallengesPageHero";
import { ChallengesPageStats } from "./ChallengesPageStats";
import { ChallengesResultsSummary } from "./ChallengesResultsSummary";
import { TopicChips } from "./TopicChips";

type Props = {
  challenges: ChallengeListItem[];
  topics: ChallengeTopicCount[];
  solvedCount: number;
  activeCount: number;
};

export function ChallengesPageView({
  challenges,
  topics,
  solvedCount,
  activeCount,
}: Props) {
  const {
    query,
    selectedDifficulties,
    selectedTopics,
    selectedLanguage,
    sort,
    topicsExpanded,
    filteredChallenges,
    activeFilterCount,
    setQuery,
    setSelectedLanguage,
    setSort,
    clearFilters,
    clearQuery,
    resetLanguage,
    toggleTopicsExpanded,
    removeDifficulty,
    removeTopic,
    toggleDifficulty,
    toggleTopic,
  } = useChallengesPageState({ challenges });

  return (
    <section className="challenge-page relative overflow-hidden py-8 sm:py-10 lg:py-12">
      <div
        aria-hidden
        className="app-motion-decorative challenge-grid-layer pointer-events-none absolute inset-0 opacity-35"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,12,24,0.12)_100%)]"
      />

      <Container className="relative">
        <ChallengesPageHero />

        <ChallengesPageStats
          totalChallenges={challenges.length}
          solvedCount={solvedCount}
          activeCount={activeCount}
        />

        <div className="mt-6 grid gap-4">
          <ChallengeFilters
            query={query}
            selectedDifficulties={selectedDifficulties}
            selectedLanguage={selectedLanguage}
            sort={sort}
            activeFilterCount={activeFilterCount}
            onQueryChange={setQuery}
            onToggleDifficulty={toggleDifficulty}
            onLanguageChange={setSelectedLanguage}
            onSortChange={setSort}
            onClearFilters={clearFilters}
          />

          <TopicChips
            topics={topics}
            selectedTopics={selectedTopics}
            expanded={topicsExpanded}
            onToggleExpanded={toggleTopicsExpanded}
            onToggleTopic={toggleTopic}
          />

          {activeFilterCount > 0 ? (
            <ChallengesActiveFilters
              query={query}
              selectedDifficulties={selectedDifficulties}
              selectedTopics={selectedTopics}
              selectedLanguage={selectedLanguage}
              onRemoveQuery={clearQuery}
              onRemoveDifficulty={removeDifficulty}
              onRemoveTopic={removeTopic}
              onResetLanguage={resetLanguage}
            />
          ) : null}

          <ChallengesResultsSummary
            filteredCount={filteredChallenges.length}
            totalCount={challenges.length}
          />

          <ChallengeList challenges={filteredChallenges} />
        </div>
      </Container>
    </section>
  );
}
