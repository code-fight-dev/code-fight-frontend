import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ChallengeListItem } from "@/entities/challenge";
import { useChallengesPageState } from "@/views/challenges/model/useChallengesPageState";

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
    summary: "Practice challenge",
    tags: ["Array"],
    category: "Algorithms",
    kind: "algorithmic",
    supportedLanguages: ["typescript", "python"],
    acceptanceRate: 60,
    estimatedMinutes: 20,
    attempts: 100,
    popularity: 500,
    createdAt: "2026-05-20T00:00:00.000Z",
    progress: "not-started",
    ...rest,
  };
}

describe("views/challenges/model/useChallengesPageState", () => {
  it("initializes with defaults and full challenge list", () => {
    const challenges = [
      createChallenge({ id: "a", title: "Alpha" }),
      createChallenge({ id: "b", title: "Beta" }),
    ];

    const { result } = renderHook(() => useChallengesPageState({ challenges }));

    expect(result.current.query).toBe("");
    expect(result.current.selectedDifficulties).toEqual([]);
    expect(result.current.selectedTopics).toEqual([]);
    expect(result.current.selectedLanguage).toBe("all");
    expect(result.current.sort).toBe("recommended");
    expect(result.current.topicsExpanded).toBe(false);
    expect(result.current.filteredChallenges).toHaveLength(2);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("toggles filters, updates query/language/sort and supports removals", () => {
    const challenges = [
      createChallenge({ id: "easy", title: "Array Basics", difficulty: "Easy" }),
      createChallenge({
        id: "hard",
        title: "Graph Paths",
        difficulty: "Hard",
        tags: ["Graph"],
      }),
    ];

    const { result } = renderHook(() => useChallengesPageState({ challenges }));

    act(() => {
      result.current.setQuery("graph");
      result.current.setSelectedLanguage("python");
      result.current.setSort("az");
      result.current.toggleDifficulty("Hard");
      result.current.toggleTopic("Graph");
    });

    expect(result.current.query).toBe("graph");
    expect(result.current.selectedLanguage).toBe("python");
    expect(result.current.sort).toBe("az");
    expect(result.current.selectedDifficulties).toEqual(["Hard"]);
    expect(result.current.selectedTopics).toEqual(["Graph"]);
    expect(result.current.activeFilterCount).toBe(4);
    expect(result.current.filteredChallenges.map((challenge) => challenge.id)).toEqual([
      "hard",
    ]);

    act(() => {
      result.current.toggleDifficulty("Hard");
      result.current.toggleTopic("Graph");
    });

    expect(result.current.selectedDifficulties).toEqual([]);
    expect(result.current.selectedTopics).toEqual([]);

    act(() => {
      result.current.toggleDifficulty("Hard");
      result.current.toggleTopic("Graph");
      result.current.removeDifficulty("Hard");
      result.current.removeTopic("Graph");
    });

    expect(result.current.selectedDifficulties).toEqual([]);
    expect(result.current.selectedTopics).toEqual([]);
  });

  it("clears filters while preserving sort and supports quick reset helpers", () => {
    const challenges = [
      createChallenge({ id: "a", title: "Alpha", difficulty: "Easy", tags: ["Array"] }),
      createChallenge({ id: "b", title: "Beta", difficulty: "Hard", tags: ["Graph"] }),
    ];

    const { result } = renderHook(() => useChallengesPageState({ challenges }));

    act(() => {
      result.current.setSort("popular");
      result.current.setQuery("Beta");
      result.current.toggleDifficulty("Hard");
      result.current.toggleTopic("Graph");
      result.current.setSelectedLanguage("python");
      result.current.toggleTopicsExpanded();
    });

    expect(result.current.topicsExpanded).toBe(true);

    act(() => {
      result.current.clearQuery();
      result.current.resetLanguage();
      result.current.clearFilters();
      result.current.toggleTopicsExpanded();
    });

    expect(result.current.query).toBe("");
    expect(result.current.selectedDifficulties).toEqual([]);
    expect(result.current.selectedTopics).toEqual([]);
    expect(result.current.selectedLanguage).toBe("all");
    expect(result.current.sort).toBe("popular");
    expect(result.current.topicsExpanded).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });
});
