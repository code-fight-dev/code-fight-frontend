import type {
  StatusComponentState,
  StatusIndicator,
  StatusPageComponent,
  StatusPageIncident,
  StatusPageSummary,
} from "./types";

const STATUS_INDICATORS: StatusIndicator[] = ["none", "minor", "major", "critical"];
const STATUS_COMPONENT_STATES: StatusComponentState[] = [
  "operational",
  "degraded_performance",
  "partial_outage",
  "major_outage",
  "under_maintenance",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function readOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function readOptionalBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function parseStatusIndicator(value: unknown): StatusIndicator | null {
  return STATUS_INDICATORS.find((entry) => entry === value) ?? null;
}

function parseStatusComponentState(value: unknown): StatusComponentState | null {
  return STATUS_COMPONENT_STATES.find((entry) => entry === value) ?? null;
}

function parsePage(value: unknown): StatusPageSummary["page"] {
  if (!isRecord(value)) {
    return {
      name: "",
      url: "",
    };
  }

  return {
    name: readOptionalString(value.name) ?? "",
    url: readOptionalString(value.url) ?? "",
  };
}

function parseStatus(value: unknown): StatusPageSummary["status"] {
  if (!isRecord(value)) {
    return {
      indicator: "major",
      description: "",
    };
  }

  return {
    indicator: parseStatusIndicator(value.indicator) ?? "major",
    description: readOptionalString(value.description) ?? "",
  };
}

function parseComponent(value: unknown): StatusPageComponent | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const name = readString(value.name);
  const status = parseStatusComponentState(value.status);

  if (!id || !name || !status) {
    return null;
  }

  return {
    id,
    name,
    status,
    description: readOptionalString(value.description),
    group: value.group === true,
    showcase: readOptionalBoolean(value.showcase),
  };
}

function parseIncident(value: unknown): StatusPageIncident | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const name = readString(value.name);
  const status = readString(value.status);
  const impact = readString(value.impact);
  const shortlink = readString(value.shortlink);

  if (!id || !name || !status || !impact || !shortlink) {
    return null;
  }

  return {
    id,
    name,
    status,
    impact,
    shortlink,
  };
}

function parseComponentList(value: unknown): StatusPageComponent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<StatusPageComponent[]>((result, entry) => {
    const parsedEntry = parseComponent(entry);

    if (parsedEntry) {
      result.push(parsedEntry);
    }

    return result;
  }, []);
}

function parseIncidentList(value: unknown): StatusPageIncident[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<StatusPageIncident[]>((result, entry) => {
    const parsedEntry = parseIncident(entry);

    if (parsedEntry) {
      result.push(parsedEntry);
    }

    return result;
  }, []);
}

export function parseStatusPageSummary(value: unknown): StatusPageSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    page: parsePage(value.page),
    status: parseStatus(value.status),
    components: parseComponentList(value.components),
    incidents: parseIncidentList(value.incidents),
  };
}
