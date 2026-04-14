import type {
  ChallengeDifficulty,
  ChallengeLanguage,
  ChallengeListItem,
} from "@/entities/challenge";
import { getChallengeTopicLabels } from "@/entities/challenge";

export type ChallengeSort = "recommended" | "newest" | "difficulty" | "popular" | "az";

export type ChallengeLanguageFilter = ChallengeLanguage | "all";

export type ChallengeFilterState = {
  query: string;
  difficulties: ChallengeDifficulty[];
  topics: string[];
  language: ChallengeLanguageFilter;
  sort: ChallengeSort;
};

export const DIFFICULTY_OPTIONS: ChallengeDifficulty[] = ["Easy", "Medium", "Hard"];

export const CHALLENGE_SORT_OPTIONS: Array<{ value: ChallengeSort; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "difficulty", label: "Difficulty" },
  { value: "popular", label: "Most popular" },
  { value: "az", label: "Alphabetical" },
];

const DIFFICULTY_WEIGHT: Record<ChallengeDifficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

const PROGRESS_WEIGHT: Record<ChallengeListItem["progress"], number> = {
  "in-progress": 4,
  "not-started": 3,
  solved: 2,
  locked: 1,
};

function matchesQuery(challenge: ChallengeListItem, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    challenge.title,
    challenge.summary,
    challenge.category,
    ...getChallengeTopicLabels(challenge),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesDifficulties(
  challenge: ChallengeListItem,
  difficulties: ChallengeDifficulty[],
) {
  return difficulties.length === 0 || difficulties.includes(challenge.difficulty);
}

function matchesTopics(challenge: ChallengeListItem, topics: string[]) {
  const challengeTopics = getChallengeTopicLabels(challenge);

  return topics.length === 0 || topics.every((topic) => challengeTopics.includes(topic));
}

function matchesLanguage(
  challenge: ChallengeListItem,
  language: ChallengeLanguageFilter,
) {
  if (language === "all") {
    return true;
  }

  if (challenge.kind === "algorithmic") {
    return language !== "sql";
  }

  return challenge.supportedLanguages.includes(language);
}

export function filterAndSortChallenges(
  challenges: ChallengeListItem[],
  filters: ChallengeFilterState,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = challenges.filter(
    (challenge) =>
      matchesQuery(challenge, normalizedQuery) &&
      matchesDifficulties(challenge, filters.difficulties) &&
      matchesTopics(challenge, filters.topics) &&
      matchesLanguage(challenge, filters.language),
  );

  return [...filtered].sort((left, right) => {
    if (filters.sort === "az") {
      return left.title.localeCompare(right.title);
    }

    if (filters.sort === "newest") {
      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    }

    if (filters.sort === "difficulty") {
      return (
        DIFFICULTY_WEIGHT[left.difficulty] - DIFFICULTY_WEIGHT[right.difficulty] ||
        left.title.localeCompare(right.title)
      );
    }

    if (filters.sort === "popular") {
      return right.popularity - left.popularity || right.attempts - left.attempts;
    }

    return (
      PROGRESS_WEIGHT[right.progress] - PROGRESS_WEIGHT[left.progress] ||
      right.popularity - left.popularity ||
      right.acceptanceRate - left.acceptanceRate
    );
  });
}

export function getActiveFilterCount(filters: ChallengeFilterState) {
  return (
    filters.difficulties.length +
    filters.topics.length +
    (filters.language === "all" ? 0 : 1) +
    (filters.query.trim() ? 1 : 0)
  );
}
