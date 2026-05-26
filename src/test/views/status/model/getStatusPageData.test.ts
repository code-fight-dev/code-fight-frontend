import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getStatusPageData } from "@/views/status/model/getStatusPageData";
import { parseStatusPageSummary } from "@/views/status/model/parseStatusPageSummary";
import type { StatusPageSummary } from "@/views/status/model/types";

vi.mock("server-only", () => ({}));

vi.mock("@/views/status/model/parseStatusPageSummary", () => ({
  parseStatusPageSummary: vi.fn(),
}));

const mockedParseStatusPageSummary = vi.mocked(parseStatusPageSummary);

function createSummary(overrides: Partial<StatusPageSummary> = {}): StatusPageSummary {
  return {
    page: {
      name: "CodeFight Status",
      url: "https://codefightstatus.statuspage.io/",
    },
    status: {
      indicator: "minor",
      description: "Partial System Outage",
    },
    components: [
      {
        id: "frontend",
        name: "Frontend",
        status: "operational",
        group: false,
        showcase: true,
      },
      {
        id: "backend",
        name: "Backend",
        status: "degraded_performance",
        group: false,
        showcase: false,
      },
      {
        id: "api-group",
        name: "API Group",
        status: "operational",
        group: true,
        showcase: true,
      },
      {
        id: "database",
        name: "Database",
        status: "operational",
        group: false,
      },
    ],
    incidents: [
      {
        id: "incident-1",
        name: "Frontend incident",
        status: "investigating",
        impact: "minor",
        shortlink: "https://stspg.io/frontend",
      },
      {
        id: "incident-2",
        name: "Invalid incident",
        status: "identified",
        impact: "major",
        shortlink: "javascript:alert(1)",
      },
      {
        id: "incident-3",
        name: "Missing shortlink incident",
        status: "monitoring",
        impact: "minor",
        shortlink: "",
      },
    ],
    ...overrides,
  } as StatusPageSummary;
}

function mockFetchResponse(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(payload),
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("views/status/model/getStatusPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();

    vi.stubEnv("STATUSPAGE_SUMMARY_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_STATUSPAGE_URL", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("returns unavailable status when summary URL is missing", async () => {
    const data = await getStatusPageData();

    expect(data).toEqual({
      isAvailable: false,
      indicator: "major",
      indicatorDescription: "Status information is currently unavailable.",
      sourceName: null,
      publicStatusPageUrl: null,
      components: [],
      incidents: [],
    });

    expect(mockedParseStatusPageSummary).not.toHaveBeenCalled();
  });

  it("returns unavailable status when summary URL is not a safe http URL", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "javascript:alert(1)");
    vi.stubEnv("NEXT_PUBLIC_STATUSPAGE_URL", "https://status.example.com");

    const data = await getStatusPageData();

    expect(data).toEqual({
      isAvailable: false,
      indicator: "major",
      indicatorDescription: "Status information is currently unavailable.",
      sourceName: null,
      publicStatusPageUrl: "https://status.example.com/",
      components: [],
      incidents: [],
    });

    expect(mockedParseStatusPageSummary).not.toHaveBeenCalled();
  });

  it("returns unavailable status when fetch response is not ok", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "https://status.example.com/summary.json");

    const fetchMock = mockFetchResponse({ error: "failed" }, false);

    const data = await getStatusPageData();

    expect(fetchMock).toHaveBeenCalledWith("https://status.example.com/summary.json", {
      next: {
        revalidate: 30,
      },
    });

    expect(data).toEqual({
      isAvailable: false,
      indicator: "major",
      indicatorDescription: "Status information is currently unavailable.",
      sourceName: null,
      publicStatusPageUrl: null,
      components: [],
      incidents: [],
    });

    expect(mockedParseStatusPageSummary).not.toHaveBeenCalled();
  });

  it("returns unavailable status when fetch throws", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "https://status.example.com/summary.json");

    const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", fetchMock);

    const data = await getStatusPageData();

    expect(data).toEqual({
      isAvailable: false,
      indicator: "major",
      indicatorDescription: "Status information is currently unavailable.",
      sourceName: null,
      publicStatusPageUrl: null,
      components: [],
      incidents: [],
    });

    expect(mockedParseStatusPageSummary).not.toHaveBeenCalled();
  });

  it("returns unavailable status when parser rejects the payload", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "https://status.example.com/summary.json");

    const payload = { invalid: true };

    mockFetchResponse(payload);
    mockedParseStatusPageSummary.mockReturnValue(null);

    const data = await getStatusPageData();

    expect(mockedParseStatusPageSummary).toHaveBeenCalledWith(payload);

    expect(data).toEqual({
      isAvailable: false,
      indicator: "major",
      indicatorDescription: "Status information is currently unavailable.",
      sourceName: null,
      publicStatusPageUrl: null,
      components: [],
      incidents: [],
    });
  });

  it("returns parsed status page data with visible components and safe incidents", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "https://status.example.com/summary.json");

    const payload = { page: "payload" };
    const summary = createSummary();

    mockFetchResponse(payload);
    mockedParseStatusPageSummary.mockReturnValue(summary);

    const data = await getStatusPageData();

    expect(data).toEqual({
      isAvailable: true,
      indicator: "minor",
      indicatorDescription: "Partial System Outage",
      sourceName: "CodeFight Status",
      publicStatusPageUrl: "https://codefightstatus.statuspage.io/",
      components: [
        {
          id: "frontend",
          name: "Frontend",
          status: "operational",
          group: false,
          showcase: true,
        },
        {
          id: "database",
          name: "Database",
          status: "operational",
          group: false,
        },
      ],
      incidents: [
        {
          id: "incident-1",
          name: "Frontend incident",
          status: "investigating",
          impact: "minor",
          shortlink: "https://stspg.io/frontend",
        },
      ],
    });
  });

  it("returns unavailable status when summary URL is blank after trimming", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "   ");
    vi.stubEnv("NEXT_PUBLIC_STATUSPAGE_URL", "   ");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const data = await getStatusPageData();

    expect(data).toEqual({
      isAvailable: false,
      indicator: "major",
      indicatorDescription: "Status information is currently unavailable.",
      sourceName: null,
      publicStatusPageUrl: null,
      components: [],
      incidents: [],
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockedParseStatusPageSummary).not.toHaveBeenCalled();
  });

  it("returns unavailable status when summary URL is malformed", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "not-a-valid-url");
    vi.stubEnv("NEXT_PUBLIC_STATUSPAGE_URL", "also-not-a-valid-url");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const data = await getStatusPageData();

    expect(data).toEqual({
      isAvailable: false,
      indicator: "major",
      indicatorDescription: "Status information is currently unavailable.",
      sourceName: null,
      publicStatusPageUrl: null,
      components: [],
      incidents: [],
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockedParseStatusPageSummary).not.toHaveBeenCalled();
  });

  it("prefers NEXT_PUBLIC_STATUSPAGE_URL over summary page URL", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "https://status.example.com/summary.json");
    vi.stubEnv("NEXT_PUBLIC_STATUSPAGE_URL", "https://public-status.example.com");

    mockFetchResponse({});
    mockedParseStatusPageSummary.mockReturnValue(createSummary());

    const data = await getStatusPageData();

    expect(data.publicStatusPageUrl).toBe("https://public-status.example.com/");
  });

  it("falls back to null source name when page name is empty", async () => {
    vi.stubEnv("STATUSPAGE_SUMMARY_URL", "https://status.example.com/summary.json");

    mockFetchResponse({});
    mockedParseStatusPageSummary.mockReturnValue(
      createSummary({
        page: {
          name: "",
          url: "https://codefightstatus.statuspage.io/",
        },
      }),
    );

    const data = await getStatusPageData();

    expect(data.sourceName).toBeNull();
  });
});
