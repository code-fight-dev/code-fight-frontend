import { describe, expect, it } from "vitest";

import { parseStatusPageSummary } from "@/views/status/model/parseStatusPageSummary";

describe("views/status/model/parseStatusPageSummary", () => {
  it("returns null when payload is not an object", () => {
    expect(parseStatusPageSummary(null)).toBeNull();
    expect(parseStatusPageSummary("invalid")).toBeNull();
    expect(parseStatusPageSummary(42)).toBeNull();
  });

  it("parses a valid Statuspage summary payload", () => {
    expect(
      parseStatusPageSummary({
        page: {
          name: " CodeFight Status ",
          url: " https://codefightstatus.statuspage.io/ ",
        },
        status: {
          indicator: "minor",
          description: " Partial System Outage ",
        },
        components: [
          {
            id: " frontend ",
            name: " Frontend ",
            status: "operational",
            description: " Public frontend ",
            group: false,
            showcase: true,
          },
          {
            id: " api ",
            name: " API ",
            status: "degraded_performance",
            description: "",
            group: true,
            showcase: false,
          },
        ],
        incidents: [
          {
            id: " incident-1 ",
            name: " API incident ",
            status: " investigating ",
            impact: " minor ",
            shortlink: " https://stspg.io/example ",
          },
        ],
      }),
    ).toEqual({
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
          description: "Public frontend",
          group: false,
          showcase: true,
        },
        {
          id: "api",
          name: "API",
          status: "degraded_performance",
          description: null,
          group: true,
          showcase: false,
        },
      ],
      incidents: [
        {
          id: "incident-1",
          name: "API incident",
          status: "investigating",
          impact: "minor",
          shortlink: "https://stspg.io/example",
        },
      ],
    });
  });

  it("uses safe defaults when page and status blocks are missing or invalid", () => {
    expect(
      parseStatusPageSummary({
        page: null,
        status: null,
        components: [],
        incidents: [],
      }),
    ).toEqual({
      page: {
        name: "",
        url: "",
      },
      status: {
        indicator: "major",
        description: "",
      },
      components: [],
      incidents: [],
    });
  });

  it("normalizes optional page and status fields", () => {
    expect(
      parseStatusPageSummary({
        page: {
          name: "   ",
          url: 123,
        },
        status: {
          indicator: "unknown",
          description: "   ",
        },
        components: [],
        incidents: [],
      }),
    ).toEqual({
      page: {
        name: "",
        url: "",
      },
      status: {
        indicator: "major",
        description: "",
      },
      components: [],
      incidents: [],
    });
  });

  it.each(["none", "minor", "major", "critical"] as const)(
    "accepts %s as status indicator",
    (indicator) => {
      expect(
        parseStatusPageSummary({
          page: {},
          status: {
            indicator,
            description: "Status description",
          },
          components: [],
          incidents: [],
        }),
      ).toMatchObject({
        status: {
          indicator,
          description: "Status description",
        },
      });
    },
  );

  it.each([
    "operational",
    "degraded_performance",
    "partial_outage",
    "major_outage",
    "under_maintenance",
  ] as const)("accepts %s as component status", (status) => {
    expect(
      parseStatusPageSummary({
        page: {},
        status: {},
        components: [
          {
            id: "component-id",
            name: "Component name",
            status,
          },
        ],
        incidents: [],
      }),
    ).toMatchObject({
      components: [
        {
          id: "component-id",
          name: "Component name",
          status,
          description: null,
          group: false,
          showcase: null,
        },
      ],
    });
  });

  it("returns empty lists when components and incidents are not arrays", () => {
    expect(
      parseStatusPageSummary({
        page: {},
        status: {},
        components: "not-array",
        incidents: "not-array",
      }),
    ).toEqual({
      page: {
        name: "",
        url: "",
      },
      status: {
        indicator: "major",
        description: "",
      },
      components: [],
      incidents: [],
    });
  });

  it("skips invalid components and keeps valid ones", () => {
    expect(
      parseStatusPageSummary({
        page: {},
        status: {},
        components: [
          null,
          {},
          {
            id: "",
            name: "Missing id",
            status: "operational",
          },
          {
            id: "missing-name",
            name: "   ",
            status: "operational",
          },
          {
            id: "invalid-status",
            name: "Invalid status",
            status: "unknown",
          },
          {
            id: "valid-component",
            name: "Valid Component",
            status: "partial_outage",
            description: 123,
            group: "not-boolean",
            showcase: "not-boolean",
          },
        ],
        incidents: [],
      }),
    ).toMatchObject({
      components: [
        {
          id: "valid-component",
          name: "Valid Component",
          status: "partial_outage",
          description: null,
          group: false,
          showcase: null,
        },
      ],
    });
  });

  it("skips invalid incidents and keeps valid ones", () => {
    expect(
      parseStatusPageSummary({
        page: {},
        status: {},
        components: [],
        incidents: [
          null,
          {},
          {
            id: "",
            name: "Missing id",
            status: "investigating",
            impact: "minor",
            shortlink: "https://stspg.io/1",
          },
          {
            id: "missing-name",
            name: "   ",
            status: "investigating",
            impact: "minor",
            shortlink: "https://stspg.io/2",
          },
          {
            id: "missing-status",
            name: "Missing status",
            status: "",
            impact: "minor",
            shortlink: "https://stspg.io/3",
          },
          {
            id: "missing-impact",
            name: "Missing impact",
            status: "investigating",
            impact: "",
            shortlink: "https://stspg.io/4",
          },
          {
            id: "missing-shortlink",
            name: "Missing shortlink",
            status: "investigating",
            impact: "minor",
            shortlink: "   ",
          },
          {
            id: "valid-incident",
            name: "Valid Incident",
            status: "monitoring",
            impact: "major",
            shortlink: "https://stspg.io/valid",
          },
        ],
      }),
    ).toMatchObject({
      incidents: [
        {
          id: "valid-incident",
          name: "Valid Incident",
          status: "monitoring",
          impact: "major",
          shortlink: "https://stspg.io/valid",
        },
      ],
    });
  });
});
