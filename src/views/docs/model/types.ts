export type DocsQuickLink = Readonly<{
  href: string;
  label: string;
}>;

export type DocsHeroMetric = Readonly<{
  caption: string;
  label: string;
  value: string;
}>;

export type DocsGettingStartedStep = Readonly<{
  ctaLabel: string;
  href: string;
  id: string;
  summary: string;
  title: string;
}>;

export type DocsGuideCard = Readonly<{
  bullets: readonly string[];
  href: string;
  id: string;
  meta: string;
  title: string;
}>;

export type DocsApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type DocsApiEndpoint = Readonly<{
  auth: "Public" | "Authenticated";
  description: string;
  method: DocsApiMethod;
  path: string;
}>;

export type DocsMatchLifecycleStep = Readonly<{
  description: string;
  id: string;
  title: string;
}>;

export type DocsFaqEntry = Readonly<{
  answer: string;
  id: string;
  question: string;
}>;

export type DocsMonacoGuide = Readonly<{
  capabilities: readonly string[];
  description: string;
  previewSnippet: string;
  settingsHref: string;
  setupSteps: readonly string[];
  title: string;
}>;

export type DocsPageData = Readonly<{
  apiEndpoints: readonly DocsApiEndpoint[];
  apiSnippet: string;
  faqEntries: readonly DocsFaqEntry[];
  gettingStartedSteps: readonly DocsGettingStartedStep[];
  guideCards: readonly DocsGuideCard[];
  heroMetrics: readonly DocsHeroMetric[];
  lifecycleSteps: readonly DocsMatchLifecycleStep[];
  monacoGuide: DocsMonacoGuide;
  quickLinks: readonly DocsQuickLink[];
  updatedAtLabel: string;
}>;
