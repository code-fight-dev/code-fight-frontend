"use client";

import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import { useDocsPageState } from "../model/useDocsPageState";
import type { DocsPageData } from "../model/types";
import { DocsHero } from "./DocsHero";
import { DocsLocalSearchPanel } from "./DocsLocalSearchPanel";
import { DocsNoSearchResults } from "./DocsNoSearchResults";
import { DocsQuickLinksPanel } from "./DocsQuickLinksPanel";
import {
  ApiReferenceSection,
  FaqSection,
  GettingStartedSection,
  MatchLifecycleSection,
  MonacoEditorSection,
  PlatformGuidesSection,
} from "./sections";

type Props = Readonly<{
  data: DocsPageData;
}>;

export function DocsPageView({ data }: Props) {
  const {
    filteredData,
    hasActiveSearch,
    hasSearchResults,
    query,
    resultsCount,
    sectionVisibility,
    setQuery,
    visibleQuickLinks,
  } = useDocsPageState(data);

  return (
    <section className="relative overflow-hidden pt-13 pb-10 sm:pt-15 sm:pb-12 lg:pt-18 lg:pb-16">
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(34,211,238,0.08),transparent_22%),linear-gradient(180deg,transparent,rgba(8,12,24,0.22)_100%)]"
      />
      <div
        aria-hidden
        className="app-motion-decorative challenge-grid-layer pointer-events-none absolute inset-0 opacity-28"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,12,24,0.18)_100%)]"
      />

      <Container className="relative">
        <DocsHero data={data} />

        <div className="mt-6">
          <DocsLocalSearchPanel
            query={query}
            resultsCount={resultsCount}
            onQueryChange={setQuery}
            onClear={() => setQuery("")}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <div className="hidden xl:block">
            <div className="sticky top-28">
              <DocsQuickLinksPanel links={visibleQuickLinks} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="xl:hidden">
              <DocsQuickLinksPanel links={visibleQuickLinks} />
            </div>

            {hasActiveSearch && !hasSearchResults ? (
              <DocsNoSearchResults query={query} />
            ) : null}

            {sectionVisibility.gettingStarted ? (
              <Reveal>
                <GettingStartedSection data={filteredData} />
              </Reveal>
            ) : null}

            {sectionVisibility.guides ? (
              <Reveal delay={70}>
                <PlatformGuidesSection data={filteredData} />
              </Reveal>
            ) : null}

            {sectionVisibility.api ? (
              <Reveal delay={110}>
                <ApiReferenceSection data={filteredData} />
              </Reveal>
            ) : null}

            {sectionVisibility.monaco ? (
              <Reveal delay={125}>
                <MonacoEditorSection data={filteredData} />
              </Reveal>
            ) : null}

            {sectionVisibility.lifecycle ? (
              <Reveal delay={140}>
                <MatchLifecycleSection data={filteredData} />
              </Reveal>
            ) : null}

            {sectionVisibility.faq ? (
              <Reveal delay={180}>
                <FaqSection data={filteredData} />
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>

      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-[#2563eb]/12 blur-3xl"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute -top-16 -left-20 h-80 w-80 rounded-full bg-[#1d4ed8]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute bottom-0 left-[24%] h-px w-44 bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.38),transparent)]"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute right-[18%] bottom-[20%] h-px w-36 bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.44),transparent)]"
      />
    </section>
  );
}
