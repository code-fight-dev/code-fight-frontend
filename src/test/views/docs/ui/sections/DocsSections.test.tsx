import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DocsPageData } from "@/views/docs/model/types";
import {
  ApiReferenceSection,
  FaqSection,
  GettingStartedSection,
  MatchLifecycleSection,
  MonacoEditorSection,
  PlatformGuidesSection,
} from "@/views/docs/ui/sections";

vi.mock("@/views/docs/ui/DocsMonacoSnippet", () => ({
  DocsMonacoSnippet: ({ fileName, value }: { fileName?: string; value: string }) => (
    <div
      data-testid="docs-monaco-snippet"
      data-file-name={fileName ?? "request.ts"}
      data-length={String(value.length)}
    >
      Monaco snippet
    </div>
  ),
}));

function createDocsData(): DocsPageData {
  return {
    updatedAtLabel: "May 25, 2026",
    quickLinks: [{ href: "#getting-started", label: "Getting Started" }],
    heroMetrics: [
      {
        label: "Metric",
        value: "42",
        caption: "Sample metric caption",
      },
    ],
    gettingStartedSteps: [
      {
        id: "create-account",
        title: "Create account",
        summary: "Create and verify account flow.",
        href: "/signup",
        ctaLabel: "Open sign up",
      },
      {
        id: "open-settings",
        title: "Configure settings",
        summary: "Tune your profile and editor options.",
        href: "/settings/profile",
        ctaLabel: "Open settings",
      },
    ],
    guideCards: [
      {
        id: "arena-guide",
        title: "Arena Matchmaking",
        meta: "Realtime duels",
        href: "/arena",
        bullets: ["Queue states", "Acceptance window", "Replay flow"],
      },
      {
        id: "leaderboard-guide",
        title: "Leaderboard",
        meta: "Competitive visibility",
        href: "/leaderboard",
        bullets: ["Podium", "Ranking table", "Rank guide"],
      },
    ],
    apiSnippet: "fetch('/api/health')",
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/health",
        auth: "Public",
        description: "Health endpoint",
      },
      {
        method: "POST",
        path: "/api/matches",
        auth: "Authenticated",
        description: "Create match",
      },
      {
        method: "PUT",
        path: "/api/matches/:id",
        auth: "Authenticated",
        description: "Update match",
      },
      {
        method: "PATCH",
        path: "/api/matches/:id/state",
        auth: "Authenticated",
        description: "Patch match state",
      },
      {
        method: "DELETE",
        path: "/api/matches/:id/delete",
        auth: "Authenticated",
        description: "Delete match",
      },
    ],
    monacoGuide: {
      title: "Monaco Editor Configuration",
      description: "Editor controls and setup flow.",
      settingsHref: "/settings/editor",
      previewSnippet: "const x = 1;",
      capabilities: ["Theme sync", "Font tuning"],
      setupSteps: ["Open settings", "Adjust options"],
    },
    lifecycleSteps: [
      {
        id: "queued",
        title: "Queued",
        description: "Player enters queue.",
      },
      {
        id: "running",
        title: "Match running",
        description: "Room is active with live updates.",
      },
    ],
    faqEntries: [
      {
        id: "faq-rated",
        question: "When does rating change?",
        answer: "Only rated matches affect Elo.",
      },
      {
        id: "faq-status",
        question: "Where to check incidents?",
        answer: "Open status page for updates.",
      },
    ],
  };
}

describe("views/docs/ui/sections", () => {
  it("renders platform guides, getting started flow and faq entries", () => {
    const data = createDocsData();

    render(
      <>
        <PlatformGuidesSection data={data} />
        <GettingStartedSection data={data} />
        <FaqSection data={data} />
      </>,
    );

    expect(
      screen.getByRole("heading", { name: "Platform Guides", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Arena Matchmaking")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open" })).toHaveLength(2);

    expect(
      screen.getByRole("heading", { name: "Getting Started", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 01")).toBeInTheDocument();
    expect(screen.getByText("Step 02")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open sign up" })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.getByRole("link", { name: "Open settings" })).toHaveAttribute(
      "href",
      "/settings/profile",
    );

    expect(
      screen.getByRole("heading", { name: "Frequently Asked Questions", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("When does rating change?")).toBeInTheDocument();
    expect(screen.getByText("Open status page for updates.")).toBeInTheDocument();
  });

  it("renders api reference endpoints with method-specific tokens", () => {
    const data = createDocsData();

    render(<ApiReferenceSection data={data} />);

    expect(
      screen.getByRole("heading", { name: "API Reference", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("docs-monaco-snippet")).toHaveAttribute(
      "data-file-name",
      "api-health.ts",
    );

    const expectedClassByMethod: Record<string, string> = {
      GET: "border-emerald-400/30",
      POST: "border-blue-400/30",
      PUT: "border-amber-400/30",
      PATCH: "border-violet-400/30",
      DELETE: "border-rose-400/30",
    };

    for (const [method, expectedClass] of Object.entries(expectedClassByMethod)) {
      expect(screen.getByText(method)).toHaveClass(expectedClass);
    }

    for (const endpoint of data.apiEndpoints) {
      expect(screen.getByText(endpoint.path)).toBeInTheDocument();
      expect(screen.getByText(endpoint.description)).toBeInTheDocument();
    }

    expect(screen.getAllByText("Public")).toHaveLength(1);
    expect(screen.getAllByText("Authenticated")).toHaveLength(4);
  });

  it("renders monaco guide and lifecycle timeline with connector only between steps", () => {
    const data = createDocsData();

    const { container } = render(
      <>
        <MonacoEditorSection data={data} />
        <MatchLifecycleSection data={data} />
      </>,
    );

    expect(
      screen.getByRole("heading", { name: "Monaco Editor Configuration", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Theme sync")).toBeInTheDocument();
    expect(screen.getByText("Font tuning")).toBeInTheDocument();
    expect(screen.getByText("Open settings")).toBeInTheDocument();
    expect(screen.getByText("Adjust options")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Editor Settings" })).toHaveAttribute(
      "href",
      "/settings/editor",
    );

    const snippetCards = screen.getAllByTestId("docs-monaco-snippet");
    expect(snippetCards).toHaveLength(1);
    expect(snippetCards[0]).toHaveAttribute("data-file-name", "editor-preview.ts");

    expect(
      screen.getByRole("heading", { name: "Arena Match Lifecycle", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Queued")).toBeInTheDocument();
    expect(screen.getByText("Match running")).toBeInTheDocument();

    const lifecycleSection = container.querySelector("#match-lifecycle");
    expect(lifecycleSection).toBeInTheDocument();
    expect(lifecycleSection?.querySelectorAll("span.w-px")).toHaveLength(
      data.lifecycleSteps.length - 1,
    );
  });
});
