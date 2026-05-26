import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DocsPageData } from "@/views/docs/model/types";
import { useDocsPageState } from "@/views/docs/model/useDocsPageState";

const docsPageData = {
  quickLinks: [
    { href: "#docs-overview", label: "Overview" },
    { href: "#getting-started", label: "Getting started" },
    { href: "#platform-guides", label: "Platform guides" },
    { href: "#api-reference", label: "API reference" },
    { href: "#monaco-editor", label: "Monaco editor" },
    { href: "#match-lifecycle", label: "Match lifecycle" },
    { href: "#faq", label: "FAQ" },
    { href: "#external", label: "External" },
  ],

  gettingStartedSteps: [
    {
      title: "Create your first arena",
      summary: "Start a live coding duel.",
      ctaLabel: "Open Arena",
    },
    {
      title: "Configure profile",
      summary: "Set up your player identity.",
      ctaLabel: "Open Settings",
    },
  ],

  guideCards: [
    {
      title: "Ranking guide",
      meta: "Competitive play",
      bullets: ["Understand tiers", "Track rating changes"],
    },
    {
      title: "Challenge workflow",
      meta: "Practice mode",
      bullets: ["Solve tasks", "Review submissions"],
    },
  ],

  apiEndpoints: [
    {
      method: "GET",
      path: "/api/status",
      auth: "public",
      description: "Read platform health information.",
    },
    {
      method: "POST",
      path: "/api/matches",
      auth: "user",
      description: "Create a private match.",
    },
  ],

  monacoGuide: {
    title: "Monaco editor settings",
    description: "Configure editor behavior and code snippets.",
    capabilities: ["themes", "font size", "word wrap"],
    setupSteps: ["Open settings", "Save preferences"],
  },

  lifecycleSteps: [
    {
      title: "Matchmaking",
      description: "Players enter the arena queue.",
    },
    {
      title: "Replay",
      description: "Finished matches can be reviewed later.",
    },
  ],

  faqEntries: [
    {
      question: "How do I reset my editor?",
      answer: "Open editor settings and reset preferences.",
    },
    {
      question: "Can I invite friends?",
      answer: "Private rooms support direct invitations.",
    },
  ],
} as unknown as DocsPageData;

function renderDocsPageState(data: DocsPageData = docsPageData) {
  return renderHook(() => useDocsPageState(data));
}

describe("views/docs/model/useDocsPageState", () => {
  it("returns the original docs data when search query is empty", () => {
    const { result } = renderDocsPageState();

    expect(result.current.query).toBe("");
    expect(result.current.filteredData).toBe(docsPageData);
    expect(result.current.hasActiveSearch).toBe(false);
    expect(result.current.hasSearchResults).toBe(true);

    expect(result.current.sectionVisibility).toEqual({
      gettingStarted: true,
      guides: true,
      api: true,
      monaco: true,
      lifecycle: true,
      faq: true,
    });

    expect(result.current.visibleQuickLinks).toEqual(docsPageData.quickLinks);
    expect(result.current.resultsCount).toBe(
      docsPageData.gettingStartedSteps.length +
        docsPageData.guideCards.length +
        docsPageData.apiEndpoints.length +
        1 +
        docsPageData.lifecycleSteps.length +
        docsPageData.faqEntries.length,
    );
  });

  it("returns no search results when query does not match any docs content", () => {
    const { result } = renderDocsPageState();

    act(() => {
      result.current.setQuery("unknown search phrase");
    });

    expect(result.current.hasActiveSearch).toBe(true);
    expect(result.current.hasSearchResults).toBe(false);
    expect(result.current.resultsCount).toBe(0);

    expect(result.current.sectionVisibility).toEqual({
      gettingStarted: false,
      guides: false,
      api: false,
      monaco: false,
      lifecycle: false,
      faq: false,
    });

    expect(result.current.visibleQuickLinks).toEqual([
      { href: "#docs-overview", label: "Overview" },
      { href: "#external", label: "External" },
    ]);
  });

  it("normalizes query and filters matching docs sections", () => {
    const { result } = renderDocsPageState();

    act(() => {
      result.current.setQuery("  API  ");
    });

    expect(result.current.query).toBe("  API  ");
    expect(result.current.hasActiveSearch).toBe(true);

    expect(result.current.filteredData.gettingStartedSteps).toHaveLength(0);
    expect(result.current.filteredData.guideCards).toHaveLength(0);
    expect(result.current.filteredData.apiEndpoints).toEqual([
      docsPageData.apiEndpoints[0],
      docsPageData.apiEndpoints[1],
    ]);
    expect(result.current.filteredData.lifecycleSteps).toHaveLength(0);
    expect(result.current.filteredData.faqEntries).toHaveLength(0);

    expect(result.current.sectionVisibility).toEqual({
      gettingStarted: false,
      guides: false,
      api: true,
      monaco: false,
      lifecycle: false,
      faq: false,
    });

    expect(result.current.visibleQuickLinks).toEqual([
      { href: "#docs-overview", label: "Overview" },
      { href: "#api-reference", label: "API reference" },
      { href: "#external", label: "External" },
    ]);

    expect(result.current.resultsCount).toBe(2);
    expect(result.current.hasSearchResults).toBe(true);
  });

  it("keeps the Monaco section visible when the active query matches Monaco guide content", () => {
    const { result } = renderDocsPageState();

    act(() => {
      result.current.setQuery("word wrap");
    });

    expect(result.current.sectionVisibility.monaco).toBe(true);
    expect(result.current.resultsCount).toBe(1);

    expect(result.current.visibleQuickLinks).toEqual([
      { href: "#docs-overview", label: "Overview" },
      { href: "#monaco-editor", label: "Monaco editor" },
      { href: "#external", label: "External" },
    ]);
  });

  it("filters every searchable docs collection by its own fields", () => {
    const { result } = renderDocsPageState();

    act(() => {
      result.current.setQuery("rating");
    });

    expect(result.current.filteredData.guideCards).toEqual([docsPageData.guideCards[0]]);
    expect(result.current.resultsCount).toBe(1);

    act(() => {
      result.current.setQuery("open arena");
    });

    expect(result.current.filteredData.gettingStartedSteps).toEqual([
      docsPageData.gettingStartedSteps[0],
    ]);
    expect(result.current.resultsCount).toBe(1);

    act(() => {
      result.current.setQuery("queue");
    });

    expect(result.current.filteredData.lifecycleSteps).toEqual([
      docsPageData.lifecycleSteps[0],
    ]);
    expect(result.current.resultsCount).toBe(1);

    act(() => {
      result.current.setQuery("invite friends");
    });

    expect(result.current.filteredData.faqEntries).toEqual([docsPageData.faqEntries[1]]);
    expect(result.current.resultsCount).toBe(1);
  });
});
