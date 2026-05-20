export type StatusIndicator = "none" | "minor" | "major" | "critical";

export type StatusComponentState =
  | "operational"
  | "degraded_performance"
  | "partial_outage"
  | "major_outage"
  | "under_maintenance";

export type StatusPageComponent = Readonly<{
  id: string;
  name: string;
  status: StatusComponentState;
  description: string | null;
  group: boolean;
  showcase: boolean | null;
}>;

export type StatusPageIncident = Readonly<{
  id: string;
  name: string;
  status: string;
  impact: string;
  shortlink: string;
}>;

export type StatusPageSummary = Readonly<{
  page: {
    name: string;
    url: string;
  };
  status: {
    indicator: StatusIndicator;
    description: string;
  };
  components: StatusPageComponent[];
  incidents: StatusPageIncident[];
}>;

export type StatusPageData = Readonly<{
  isAvailable: boolean;
  indicator: StatusIndicator;
  indicatorDescription: string;
  sourceName: string | null;
  publicStatusPageUrl: string | null;
  components: StatusPageComponent[];
  incidents: StatusPageIncident[];
}>;
