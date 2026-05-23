"use client";

import { useMemo, useState } from "react";
import type { DocsPageData, DocsQuickLink } from "./types";

type DocsSectionVisibility = Readonly<{
  api: boolean;
  faq: boolean;
  gettingStarted: boolean;
  guides: boolean;
  lifecycle: boolean;
  monaco: boolean;
}>;

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

function getSectionVisibility(
  data: DocsPageData,
  filteredData: DocsPageData,
  hasActiveSearch: boolean,
  normalizedQuery: string,
): DocsSectionVisibility {
  return {
    gettingStarted: filteredData.gettingStartedSteps.length > 0,
    guides: filteredData.guideCards.length > 0,
    api: filteredData.apiEndpoints.length > 0,
    monaco:
      !hasActiveSearch ||
      includesQuery(
        `${data.monacoGuide.title} ${data.monacoGuide.description} ${data.monacoGuide.capabilities.join(" ")} ${data.monacoGuide.setupSteps.join(" ")}`,
        normalizedQuery,
      ),
    lifecycle: filteredData.lifecycleSteps.length > 0,
    faq: filteredData.faqEntries.length > 0,
  };
}

function isQuickLinkVisible(
  quickLink: DocsQuickLink,
  sectionVisibility: DocsSectionVisibility,
) {
  switch (quickLink.href) {
    case "#docs-overview":
      return true;
    case "#getting-started":
      return sectionVisibility.gettingStarted;
    case "#platform-guides":
      return sectionVisibility.guides;
    case "#api-reference":
      return sectionVisibility.api;
    case "#monaco-editor":
      return sectionVisibility.monaco;
    case "#match-lifecycle":
      return sectionVisibility.lifecycle;
    case "#faq":
      return sectionVisibility.faq;
    default:
      return true;
  }
}

export function useDocsPageState(data: DocsPageData) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeQuery(query);
  const hasActiveSearch = normalizedQuery.length > 0;

  const filteredData = useMemo(() => {
    if (!hasActiveSearch) {
      return data;
    }

    return {
      ...data,
      gettingStartedSteps: data.gettingStartedSteps.filter((step) =>
        includesQuery(`${step.title} ${step.summary} ${step.ctaLabel}`, normalizedQuery),
      ),
      guideCards: data.guideCards.filter((card) =>
        includesQuery(
          `${card.title} ${card.meta} ${card.bullets.join(" ")}`,
          normalizedQuery,
        ),
      ),
      apiEndpoints: data.apiEndpoints.filter((endpoint) =>
        includesQuery(
          `${endpoint.method} ${endpoint.path} ${endpoint.auth} ${endpoint.description}`,
          normalizedQuery,
        ),
      ),
      lifecycleSteps: data.lifecycleSteps.filter((step) =>
        includesQuery(`${step.title} ${step.description}`, normalizedQuery),
      ),
      faqEntries: data.faqEntries.filter((entry) =>
        includesQuery(`${entry.question} ${entry.answer}`, normalizedQuery),
      ),
    };
  }, [data, hasActiveSearch, normalizedQuery]);

  const sectionVisibility = getSectionVisibility(
    data,
    filteredData,
    hasActiveSearch,
    normalizedQuery,
  );

  const visibleQuickLinks = useMemo(
    () =>
      data.quickLinks.filter((quickLink) =>
        isQuickLinkVisible(quickLink, sectionVisibility),
      ),
    [data.quickLinks, sectionVisibility],
  );

  const resultsCount =
    filteredData.gettingStartedSteps.length +
    filteredData.guideCards.length +
    filteredData.apiEndpoints.length +
    (sectionVisibility.monaco ? 1 : 0) +
    filteredData.lifecycleSteps.length +
    filteredData.faqEntries.length;

  return {
    filteredData,
    hasActiveSearch,
    hasSearchResults: resultsCount > 0,
    query,
    resultsCount,
    sectionVisibility,
    setQuery,
    visibleQuickLinks,
  };
}
