import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChallengeListItem, ChallengeTopicCount } from "@/entities/challenge";
import { ChallengesPageView } from "@/views/challenges/ui/ChallengesPageView";

const pageViewMocks = vi.hoisted(() => ({
  useChallengesPageState: vi.fn(),
  ChallengesPageHero: vi.fn(),
  ChallengesPageStats: vi.fn(),
  ChallengeFilters: vi.fn(),
  TopicChips: vi.fn(),
  ChallengesActiveFilters: vi.fn(),
  ChallengesResultsSummary: vi.fn(),
  ChallengeList: vi.fn(),
}));

vi.mock("@/views/challenges/model/useChallengesPageState", () => ({
  useChallengesPageState: pageViewMocks.useChallengesPageState,
}));

vi.mock("@/views/challenges/ui/ChallengesPageHero", () => ({
  ChallengesPageHero: () => {
    pageViewMocks.ChallengesPageHero();
    return <div data-testid="hero">hero</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengesPageStats", () => ({
  ChallengesPageStats: (props: Record<string, unknown>) => {
    pageViewMocks.ChallengesPageStats(props);
    return <div data-testid="stats">stats</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengeFilters", () => ({
  ChallengeFilters: (props: Record<string, unknown>) => {
    pageViewMocks.ChallengeFilters(props);
    return <div data-testid="filters">filters</div>;
  },
}));

vi.mock("@/views/challenges/ui/TopicChips", () => ({
  TopicChips: (props: Record<string, unknown>) => {
    pageViewMocks.TopicChips(props);
    return <div data-testid="topics">topics</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengesActiveFilters", () => ({
  ChallengesActiveFilters: (props: Record<string, unknown>) => {
    pageViewMocks.ChallengesActiveFilters(props);
    return <div data-testid="active-filters">active-filters</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengesResultsSummary", () => ({
  ChallengesResultsSummary: (props: Record<string, unknown>) => {
    pageViewMocks.ChallengesResultsSummary(props);
    return <div data-testid="summary">summary</div>;
  },
}));

vi.mock("@/views/challenges/ui/ChallengeList", () => ({
  ChallengeList: (props: Record<string, unknown>) => {
    pageViewMocks.ChallengeList(props);
    return <div data-testid="list">list</div>;
  },
}));

function createChallenge(id: string): ChallengeListItem {
  return {
    id,
    slug: id,
    title: id,
    difficulty: "Medium",
    summary: "summary",
    tags: ["Array"],
    category: "Algorithms",
    kind: "algorithmic",
    supportedLanguages: ["typescript"],
    acceptanceRate: 50,
    estimatedMinutes: 20,
    attempts: 100,
    popularity: 200,
    createdAt: "2026-05-20T00:00:00.000Z",
    progress: "not-started",
  };
}

function createState(overrides: Record<string, unknown> = {}) {
  return {
    query: "",
    selectedDifficulties: [],
    selectedTopics: [],
    selectedLanguage: "all",
    sort: "recommended",
    topicsExpanded: false,
    filteredChallenges: [createChallenge("challenge-1")],
    activeFilterCount: 0,
    setQuery: vi.fn(),
    setSelectedLanguage: vi.fn(),
    setSort: vi.fn(),
    clearFilters: vi.fn(),
    clearQuery: vi.fn(),
    resetLanguage: vi.fn(),
    toggleTopicsExpanded: vi.fn(),
    removeDifficulty: vi.fn(),
    removeTopic: vi.fn(),
    toggleDifficulty: vi.fn(),
    toggleTopic: vi.fn(),
    ...overrides,
  };
}

describe("views/challenges/ui/ChallengesPageView", () => {
  const challenges: ChallengeListItem[] = [
    createChallenge("challenge-1"),
    createChallenge("challenge-2"),
  ];
  const topics: ChallengeTopicCount[] = [{ name: "Array", count: 2 }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page sections and forwards base state props", () => {
    pageViewMocks.useChallengesPageState.mockReturnValue(createState());

    render(
      <ChallengesPageView
        challenges={challenges}
        topics={topics}
        solvedCount={10}
        activeCount={2}
      />,
    );

    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("stats")).toBeInTheDocument();
    expect(screen.getByTestId("filters")).toBeInTheDocument();
    expect(screen.getByTestId("topics")).toBeInTheDocument();
    expect(screen.getByTestId("summary")).toBeInTheDocument();
    expect(screen.getByTestId("list")).toBeInTheDocument();
    expect(screen.queryByTestId("active-filters")).not.toBeInTheDocument();

    expect(pageViewMocks.useChallengesPageState).toHaveBeenCalledWith({ challenges });
    expect(pageViewMocks.ChallengesPageStats).toHaveBeenCalledWith(
      expect.objectContaining({
        totalChallenges: 2,
        solvedCount: 10,
        activeCount: 2,
      }),
    );
    expect(pageViewMocks.ChallengeList).toHaveBeenCalledWith(
      expect.objectContaining({
        challenges: [createChallenge("challenge-1")],
      }),
    );
  });

  it("renders active filter bar when filter count is non-zero", () => {
    pageViewMocks.useChallengesPageState.mockReturnValue(
      createState({
        query: "graph",
        selectedDifficulties: ["Hard"],
        selectedTopics: ["BFS"],
        selectedLanguage: "python",
        activeFilterCount: 3,
      }),
    );

    render(
      <ChallengesPageView
        challenges={challenges}
        topics={topics}
        solvedCount={0}
        activeCount={0}
      />,
    );

    expect(screen.getByTestId("active-filters")).toBeInTheDocument();
    expect(pageViewMocks.ChallengesActiveFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "graph",
        selectedDifficulties: ["Hard"],
        selectedTopics: ["BFS"],
        selectedLanguage: "python",
      }),
    );
  });
});
