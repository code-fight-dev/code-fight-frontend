import { afterEach, describe, expect, it, vi } from "vitest";

import { getDocsPageData } from "@/views/docs/model/getDocsPageData";

describe("views/docs/model/getDocsPageData", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns static docs page data with deterministic updated label", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00.000Z"));

    const data = getDocsPageData();

    expect(data.updatedAtLabel).toBe("May 26, 2026");

    expect(data.quickLinks).toEqual([
      { href: "#docs-overview", label: "Overview" },
      { href: "#getting-started", label: "Getting Started" },
      { href: "#platform-guides", label: "Platform Guides" },
      { href: "#api-reference", label: "API Reference" },
      { href: "#monaco-editor", label: "Monaco Editor" },
      { href: "#match-lifecycle", label: "Match Lifecycle" },
      { href: "#faq", label: "FAQ" },
    ]);

    expect(data.heroMetrics).toHaveLength(3);
    expect(data.gettingStartedSteps).toHaveLength(4);
    expect(data.guideCards).toHaveLength(7);
    expect(data.apiEndpoints).toHaveLength(2);
    expect(data.lifecycleSteps).toHaveLength(5);
    expect(data.faqEntries).toHaveLength(5);

    expect(data.apiSnippet).toContain('fetch("/api/health"');
    expect(data.monacoGuide).toMatchObject({
      title: "Monaco Editor Configuration",
      settingsHref: "/settings/editor",
    });

    expect(data.apiEndpoints).toEqual([
      {
        method: "GET",
        path: "/api/health",
        auth: "Public",
        description:
          "Service heartbeat endpoint for readiness checks and lightweight monitoring.",
      },
      {
        method: "GET",
        path: "/api/locations",
        auth: "Public",
        description:
          "Location catalog used by profile settings location selector and related forms.",
      },
    ]);

    expect(data.faqEntries.map((entry) => entry.id)).toEqual([
      "faq-ranked",
      "faq-auth",
      "faq-layout",
      "faq-status",
      "faq-support",
    ]);
  });
});
