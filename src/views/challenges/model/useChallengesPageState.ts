"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { ChallengeDifficulty, ChallengeListItem } from "@/entities/challenge";
import {
  filterAndSortChallenges,
  getActiveFilterCount,
  type ChallengeFilterState,
  type ChallengeLanguageFilter,
  type ChallengeSort,
} from "./filters";

function toggleItem<T>(items: T[], item: T) {
  if (items.includes(item)) {
    return items.filter((currentItem) => currentItem !== item);
  }

  return [...items, item];
}

type Options = {
  challenges: ChallengeListItem[];
};

export function useChallengesPageState({ challenges }: Options) {
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

  function clearFilters() {
    // "Clear filters" intentionally preserves selected sort mode.
    setQuery("");
    setSelectedDifficulties([]);
    setSelectedTopics([]);
    setSelectedLanguage("all");
  }

  return {
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
    clearQuery: () => setQuery(""),
    resetLanguage: () => setSelectedLanguage("all"),
    toggleTopicsExpanded: () => setTopicsExpanded((expanded) => !expanded),
    removeDifficulty: (difficulty: ChallengeDifficulty) =>
      setSelectedDifficulties((currentDifficulties) =>
        currentDifficulties.filter(
          (currentDifficulty) => currentDifficulty !== difficulty,
        ),
      ),
    removeTopic: (topic: string) =>
      setSelectedTopics((currentTopics) =>
        currentTopics.filter((currentTopic) => currentTopic !== topic),
      ),
    toggleDifficulty: (difficulty: ChallengeDifficulty) =>
      setSelectedDifficulties((currentDifficulties) =>
        toggleItem(currentDifficulties, difficulty),
      ),
    toggleTopic: (topic: string) =>
      setSelectedTopics((currentTopics) => toggleItem(currentTopics, topic)),
  };
}
