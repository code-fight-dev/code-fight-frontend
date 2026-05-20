import "server-only";

import { parseStatusPageSummary } from "./parseStatusPageSummary";
import type {
  StatusPageComponent,
  StatusPageData,
  StatusPageIncident,
  StatusPageSummary,
} from "./types";

export type { StatusPageData } from "./types";

const STATUS_PAGE_REVALIDATE_SECONDS = 30;
const STATUS_UNAVAILABLE_MESSAGE = "Status information is currently unavailable.";

function sanitizeHttpUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalized);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function getVisibleComponents(components: StatusPageComponent[]) {
  return components.filter(
    (component) => !component.group && component.showcase !== false,
  );
}

function getPublicStatusPageUrl(summary: StatusPageSummary | null) {
  const preferredUrl = sanitizeHttpUrl(process.env.NEXT_PUBLIC_STATUSPAGE_URL);

  if (preferredUrl) {
    return preferredUrl;
  }

  return sanitizeHttpUrl(summary?.page.url);
}

function getSafeIncidents(incidents: StatusPageIncident[]) {
  return incidents.reduce<StatusPageIncident[]>((result, incident) => {
    const sanitizedShortlink = sanitizeHttpUrl(incident.shortlink);

    if (!sanitizedShortlink) {
      return result;
    }

    result.push({
      ...incident,
      shortlink: sanitizedShortlink,
    });

    return result;
  }, []);
}

async function getStatusPageSummary(): Promise<StatusPageSummary | null> {
  const summaryUrl = sanitizeHttpUrl(process.env.STATUSPAGE_SUMMARY_URL);

  if (!summaryUrl) {
    return null;
  }

  try {
    const response = await fetch(summaryUrl, {
      next: {
        revalidate: STATUS_PAGE_REVALIDATE_SECONDS,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return parseStatusPageSummary(payload);
  } catch {
    return null;
  }
}

export async function getStatusPageData(): Promise<StatusPageData> {
  const summary = await getStatusPageSummary();

  if (!summary) {
    return {
      isAvailable: false,
      indicator: "major",
      indicatorDescription: STATUS_UNAVAILABLE_MESSAGE,
      sourceName: null,
      publicStatusPageUrl: getPublicStatusPageUrl(null),
      components: [],
      incidents: [],
    };
  }

  return {
    isAvailable: true,
    indicator: summary.status.indicator,
    indicatorDescription: summary.status.description,
    sourceName: summary.page.name || null,
    publicStatusPageUrl: getPublicStatusPageUrl(summary),
    components: getVisibleComponents(summary.components),
    incidents: getSafeIncidents(summary.incidents),
  };
}
