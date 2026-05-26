import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DocsPageData } from "@/views/docs/model/types";

const mocks = vi.hoisted(() => ({
  setQuery: vi.fn(),
  useDocsPageState: vi.fn(),
}));

vi.mock("@/shared/ui/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="container">{children}</div>
  ),
}));

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({ children, delay }: { children: React.ReactNode; delay?: number }) => (
    <div data-delay={delay ?? 0} data-testid="reveal">
      {children}
    </div>
  ),
}));

vi.mock("@/views/docs/model/useDocsPageState", () => ({
  useDocsPageState: mocks.useDocsPageState,
}));

vi.mock("@/views/docs/ui/DocsHero", () => ({
  DocsHero: () => <div data-testid="docs-hero">Docs hero</div>,
}));

vi.mock("@/views/docs/ui/DocsLocalSearchPanel", () => ({
  DocsLocalSearchPanel: ({
    query,
    resultsCount,
    onQueryChange,
    onClear,
  }: {
    query: string;
    resultsCount: number;
    onQueryChange: (value: string) => void;
    onClear: () => void;
  }) => (
    <div data-testid="docs-search">
      <span>Query: {query}</span>
      <span>Results: {resultsCount}</span>
      <button onClick={() => onQueryChange("api")} type="button">
        Change query
      </button>
      <button onClick={onClear} type="button">
        Clear query
      </button>
    </div>
  ),
}));

vi.mock("@/views/docs/ui/DocsNoSearchResults", () => ({
  DocsNoSearchResults: ({ query }: { query: string }) => (
    <div data-testid="docs-no-results">No results for {query}</div>
  ),
}));

vi.mock("@/views/docs/ui/DocsQuickLinksPanel", () => ({
  DocsQuickLinksPanel: ({ links }: { links: unknown[] }) => (
    <div data-testid="docs-quick-links">Quick links: {links.length}</div>
  ),
}));

vi.mock("@/views/docs/ui/sections", () => ({
  ApiReferenceSection: () => <div>API section</div>,
  FaqSection: () => <div>FAQ section</div>,
  GettingStartedSection: () => <div>Getting started section</div>,
  MatchLifecycleSection: () => <div>Lifecycle section</div>,
  MonacoEditorSection: () => <div>Monaco section</div>,
  PlatformGuidesSection: () => <div>Guides section</div>,
}));

import { useDocsPageState } from "@/views/docs/model/useDocsPageState";
import { DocsPageView } from "@/views/docs/ui/DocsPageView";

const mockedUseDocsPageState = vi.mocked(useDocsPageState);

const docsPageData = {
  hero: {
    eyebrow: "Docs",
    title: "CodeFight Docs",
    description: "Documentation",
  },
} as unknown as DocsPageData;

function mockDocsPageState(overrides: Partial<ReturnType<typeof useDocsPageState>> = {}) {
  mockedUseDocsPageState.mockReturnValue({
    filteredData: docsPageData,
    hasActiveSearch: false,
    hasSearchResults: true,
    query: "",
    resultsCount: 6,
    sectionVisibility: {
      gettingStarted: true,
      guides: true,
      api: true,
      monaco: true,
      lifecycle: true,
      faq: true,
    },
    setQuery: mocks.setQuery,
    visibleQuickLinks: [
      { href: "#getting-started", label: "Getting started" },
      { href: "#api", label: "API" },
    ],
    ...overrides,
  });
}

describe("views/docs/ui/DocsPageView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDocsPageState();
  });

  it("renders docs layout with hero, search, quick links and all sections", () => {
    render(<DocsPageView data={docsPageData} />);

    expect(mockedUseDocsPageState).toHaveBeenCalledWith(docsPageData);

    expect(screen.getByTestId("container")).toBeTruthy();
    expect(screen.getByTestId("docs-hero")).toBeTruthy();
    expect(screen.getByTestId("docs-search")).toBeTruthy();

    expect(screen.getAllByTestId("docs-quick-links")).toHaveLength(2);
    expect(screen.getAllByText("Quick links: 2")).toHaveLength(2);

    expect(screen.getByText("Getting started section")).toBeTruthy();
    expect(screen.getByText("Guides section")).toBeTruthy();
    expect(screen.getByText("API section")).toBeTruthy();
    expect(screen.getByText("Monaco section")).toBeTruthy();
    expect(screen.getByText("Lifecycle section")).toBeTruthy();
    expect(screen.getByText("FAQ section")).toBeTruthy();

    expect(screen.queryByTestId("docs-no-results")).toBeNull();
  });

  it("renders only sections marked as visible", () => {
    mockDocsPageState({
      sectionVisibility: {
        gettingStarted: true,
        guides: false,
        api: true,
        monaco: false,
        lifecycle: true,
        faq: false,
      },
    });

    render(<DocsPageView data={docsPageData} />);

    expect(screen.getByText("Getting started section")).toBeTruthy();
    expect(screen.getByText("API section")).toBeTruthy();
    expect(screen.getByText("Lifecycle section")).toBeTruthy();

    expect(screen.queryByText("Guides section")).toBeNull();
    expect(screen.queryByText("Monaco section")).toBeNull();
    expect(screen.queryByText("FAQ section")).toBeNull();
  });

  it("renders no-results message when active search has no matches", () => {
    mockDocsPageState({
      hasActiveSearch: true,
      hasSearchResults: false,
      query: "unknown topic",
      resultsCount: 0,
    });

    render(<DocsPageView data={docsPageData} />);

    expect(screen.getByTestId("docs-no-results").textContent).toBe(
      "No results for unknown topic",
    );
  });

  it("does not render no-results message when search is inactive", () => {
    mockDocsPageState({
      hasActiveSearch: false,
      hasSearchResults: false,
      query: "",
      resultsCount: 0,
    });

    render(<DocsPageView data={docsPageData} />);

    expect(screen.queryByTestId("docs-no-results")).toBeNull();
  });

  it("does not render any docs section when all sections are hidden", () => {
    mockDocsPageState({
      sectionVisibility: {
        gettingStarted: false,
        guides: false,
        api: false,
        monaco: false,
        lifecycle: false,
        faq: false,
      },
    });

    render(<DocsPageView data={docsPageData} />);

    expect(screen.queryByText("Getting started section")).toBeNull();
    expect(screen.queryByText("Guides section")).toBeNull();
    expect(screen.queryByText("API section")).toBeNull();
    expect(screen.queryByText("Monaco section")).toBeNull();
    expect(screen.queryByText("Lifecycle section")).toBeNull();
    expect(screen.queryByText("FAQ section")).toBeNull();
  });

  it("passes search actions to the local search panel", () => {
    mockDocsPageState({
      query: "monaco",
      resultsCount: 3,
    });

    render(<DocsPageView data={docsPageData} />);

    expect(screen.getByText("Query: monaco")).toBeTruthy();
    expect(screen.getByText("Results: 3")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Change query" }));
    expect(mocks.setQuery).toHaveBeenCalledWith("api");

    fireEvent.click(screen.getByRole("button", { name: "Clear query" }));
    expect(mocks.setQuery).toHaveBeenCalledWith("");
  });
});
