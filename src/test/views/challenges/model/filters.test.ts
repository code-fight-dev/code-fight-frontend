import { describe, expect, it } from "vitest";

import type {
  ChallengeDifficulty,
  ChallengeLanguage,
  ChallengeListItem,
} from "@/entities/challenge";
import {
  filterAndSortChallenges,
  getActiveFilterCount,
  type ChallengeFilterState,
} from "@/views/challenges/model/filters";

function createChallenge(
  overrides: Partial<ChallengeListItem> & {
    id: string;
    title: string;
  },
): ChallengeListItem {
  const { id, title, ...rest } = overrides;

  return {
    id,
    slug: title.toLowerCase().replaceAll(" ", "-"),
    title,
    difficulty: "Medium",
    summary: "Array and hash map pattern",
    tags: ["Array", "Hash Table"],
    category: "Algorithms",
    kind: "algorithmic",
    supportedLanguages: ["typescript", "python"],
    acceptanceRate: 60,
    estimatedMinutes: 25,
    attempts: 900,
    popularity: 2000,
    createdAt: "2026-05-20T00:00:00.000Z",
    progress: "not-started",
    ...rest,
  };
}

function createFilters(
  overrides: Partial<ChallengeFilterState> = {},
): ChallengeFilterState {
  return {
    query: "",
    difficulties: [],
    topics: [],
    language: "all",
    sort: "recommended",
    ...overrides,
  };
}

describe("views/challenges/model/filters", () => {
  it("filters by normalized query, difficulty, topics and language", () => {
    const challenges = [
      createChallenge({
        id: "a",
        title: "Two Sum",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        kind: "algorithmic",
      }),
      createChallenge({
        id: "b",
        title: "Sales by Country",
        summary: "Aggregate SQL rows",
        tags: ["Database", "Aggregation"],
        category: "Databases",
        kind: "sql",
        supportedLanguages: ["sql"],
        difficulty: "Hard",
      }),
    ];

    const result = filterAndSortChallenges(
      challenges,
      createFilters({
        query: "  agGREgate ",
        difficulties: ["Hard"],
        topics: ["SQL", "Aggregation"],
        language: "sql",
      }),
    );

    expect(result).toEqual([challenges[1]]);
  });

  it("excludes algorithmic challenges from sql language filter", () => {
    const challenges = [
      createChallenge({ id: "algo", title: "Two Sum", kind: "algorithmic" }),
      createChallenge({
        id: "sql",
        title: "Daily Revenue",
        kind: "sql",
        supportedLanguages: ["sql"],
      }),
    ];

    const result = filterAndSortChallenges(
      challenges,
      createFilters({
        language: "sql",
      }),
    );

    expect(result.map((challenge) => challenge.id)).toEqual(["sql"]);
  });

  it("sorts alphabetically for az mode", () => {
    const challenges = [
      createChallenge({ id: "1", title: "Zeta" }),
      createChallenge({ id: "2", title: "Alpha" }),
      createChallenge({ id: "3", title: "Beta" }),
    ];

    const result = filterAndSortChallenges(
      challenges,
      createFilters({
        sort: "az",
      }),
    );

    expect(result.map((challenge) => challenge.title)).toEqual(["Alpha", "Beta", "Zeta"]);
  });

  it("sorts by newest created date", () => {
    const challenges = [
      createChallenge({
        id: "old",
        title: "Old",
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
      createChallenge({
        id: "new",
        title: "New",
        createdAt: "2026-05-01T00:00:00.000Z",
      }),
    ];

    const result = filterAndSortChallenges(
      challenges,
      createFilters({
        sort: "newest",
      }),
    );

    expect(result.map((challenge) => challenge.id)).toEqual(["new", "old"]);
  });

  it("sorts by difficulty weight and uses title as tie-breaker", () => {
    const challenges = [
      createChallenge({ id: "c", title: "Gamma", difficulty: "Hard" }),
      createChallenge({ id: "a", title: "Alpha", difficulty: "Hard" }),
      createChallenge({ id: "b", title: "Beta", difficulty: "Easy" }),
    ];

    const result = filterAndSortChallenges(
      challenges,
      createFilters({
        sort: "difficulty",
      }),
    );

    expect(result.map((challenge) => challenge.id)).toEqual(["b", "a", "c"]);
  });

  it("sorts by popularity then attempts in popular mode", () => {
    const challenges = [
      createChallenge({ id: "a", title: "A", popularity: 5000, attempts: 100 }),
      createChallenge({ id: "b", title: "B", popularity: 5000, attempts: 900 }),
      createChallenge({ id: "c", title: "C", popularity: 3000, attempts: 2000 }),
    ];

    const result = filterAndSortChallenges(
      challenges,
      createFilters({
        sort: "popular",
      }),
    );

    expect(result.map((challenge) => challenge.id)).toEqual(["b", "a", "c"]);
  });

  it("uses recommended sorting by progress, popularity and acceptance rate", () => {
    const challenges = [
      createChallenge({
        id: "in-progress",
        title: "In Progress",
        progress: "in-progress",
        popularity: 200,
        acceptanceRate: 30,
      }),
      createChallenge({
        id: "not-started-high",
        title: "Not Started High",
        progress: "not-started",
        popularity: 500,
        acceptanceRate: 70,
      }),
      createChallenge({
        id: "not-started-low",
        title: "Not Started Low",
        progress: "not-started",
        popularity: 100,
        acceptanceRate: 95,
      }),
      createChallenge({
        id: "solved",
        title: "Solved",
        progress: "solved",
        popularity: 5000,
        acceptanceRate: 80,
      }),
      createChallenge({
        id: "locked",
        title: "Locked",
        progress: "locked",
        popularity: 9999,
        acceptanceRate: 99,
      }),
    ];

    const result = filterAndSortChallenges(challenges, createFilters());

    expect(result.map((challenge) => challenge.id)).toEqual([
      "in-progress",
      "not-started-high",
      "not-started-low",
      "solved",
      "locked",
    ]);
  });

  it("counts active filters including trimmed query and non-default language", () => {
    expect(
      getActiveFilterCount(
        createFilters({
          query: "  ",
          difficulties: [],
          topics: [],
          language: "all",
        }),
      ),
    ).toBe(0);

    expect(
      getActiveFilterCount(
        createFilters({
          query: " two sum ",
          difficulties: ["Easy", "Hard"] satisfies ChallengeDifficulty[],
          topics: ["Array", "Math"],
          language: "python" satisfies ChallengeLanguage,
        }),
      ),
    ).toBe(6);
  });
});
