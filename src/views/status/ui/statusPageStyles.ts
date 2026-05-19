import type { StatusComponentState, StatusIndicator } from "../model/types";

type IndicatorVisual = {
  label: string;
  cardClassName: string;
  dotClassName: string;
};

type ComponentStatusVisual = {
  label: string;
  dotClassName: string;
  badgeClassName: string;
};

export const statusPageClassNames = {
  root: "status-page challenge-page relative overflow-hidden bg-(--app-surface-base) py-20 sm:py-24",
  gridLayer: "challenge-grid-layer pointer-events-none absolute inset-0 opacity-35",
  gridFade:
    "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,12,24,0.14)_100%)]",
  primaryGlow:
    "pointer-events-none absolute -top-24 -left-20 h-80 w-96 rounded-full bg-[#1d4ed8]/10 blur-3xl",
  secondaryGlow:
    "pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#2563eb]/10 blur-3xl",
  content: "relative",
  componentsGrid: "mt-8 grid gap-4 md:grid-cols-2",
  emptyState:
    "mt-8 rounded-2xl border border-white/10 bg-white/3 px-4 py-4 text-sm text-(--app-text-soft)",
  componentCard: "rounded-2xl border border-white/10 bg-white/3 px-4 py-3",
  componentTitle:
    "font-accent text-xl font-semibold tracking-[-0.04em] text-(--app-text-strong)",
  componentDescription: "mt-2 text-sm leading-6 text-(--app-text-soft)",
  incidentsSection:
    "rounded-3xl border border-(--app-header-border-soft) bg-(--app-surface-card)/70 p-6 backdrop-blur",
  incidentLink:
    "block rounded-2xl border border-(--app-header-border-soft) p-4 transition-colors hover:bg-white/5",
} as const;

export const statusIndicatorVisuals = {
  none: {
    label: "All Systems Operational",
    cardClassName: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
    dotClassName: "bg-emerald-400",
  },
  minor: {
    label: "Minor Service Outage",
    cardClassName: "border-yellow-400/25 bg-yellow-400/10 text-yellow-100",
    dotClassName: "bg-yellow-400",
  },
  major: {
    label: "Major Service Outage",
    cardClassName: "border-orange-400/25 bg-orange-400/10 text-orange-100",
    dotClassName: "bg-orange-400",
  },
  critical: {
    label: "Critical Service Outage",
    cardClassName: "border-red-400/25 bg-red-400/10 text-red-100",
    dotClassName: "bg-red-400",
  },
} as const satisfies Record<StatusIndicator, IndicatorVisual>;

export const componentStatusVisuals = {
  operational: {
    label: "Operational",
    dotClassName: "bg-emerald-400",
    badgeClassName: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  degraded_performance: {
    label: "Degraded",
    dotClassName: "bg-yellow-400",
    badgeClassName: "border-yellow-400/30 bg-yellow-400/10 text-yellow-100",
  },
  partial_outage: {
    label: "Partial outage",
    dotClassName: "bg-orange-400",
    badgeClassName: "border-orange-400/30 bg-orange-400/10 text-orange-100",
  },
  major_outage: {
    label: "Major outage",
    dotClassName: "bg-red-400",
    badgeClassName: "border-red-400/30 bg-red-400/10 text-red-100",
  },
  under_maintenance: {
    label: "Maintenance",
    dotClassName: "bg-sky-400",
    badgeClassName: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  },
} as const satisfies Record<StatusComponentState, ComponentStatusVisual>;
