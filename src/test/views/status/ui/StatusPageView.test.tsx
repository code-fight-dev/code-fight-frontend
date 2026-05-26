import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { StatusPageData } from "@/views/status/model/types";
import { StatusPageView } from "@/views/status/ui/StatusPageView";

const statusPageViewMocks = vi.hoisted(() => ({
  StatusPageHero: vi.fn(),
  StatusOverviewCard: vi.fn(),
  StatusComponentsGrid: vi.fn(),
  StatusIncidentsSection: vi.fn(),
}));

vi.mock("@/views/status/ui/StatusPageHero", () => ({
  StatusPageHero: () => {
    statusPageViewMocks.StatusPageHero();
    return <div data-testid="status-page-hero">hero</div>;
  },
}));

vi.mock("@/views/status/ui/StatusOverviewCard", () => ({
  StatusOverviewCard: (props: Record<string, unknown>) => {
    statusPageViewMocks.StatusOverviewCard(props);
    return <div data-testid="status-overview-card">overview</div>;
  },
}));

vi.mock("@/views/status/ui/StatusComponentsGrid", () => ({
  StatusComponentsGrid: (props: Record<string, unknown>) => {
    statusPageViewMocks.StatusComponentsGrid(props);
    return <div data-testid="status-components-grid">components</div>;
  },
}));

vi.mock("@/views/status/ui/StatusIncidentsSection", () => ({
  StatusIncidentsSection: (props: Record<string, unknown>) => {
    statusPageViewMocks.StatusIncidentsSection(props);
    return <div data-testid="status-incidents-section">incidents</div>;
  },
}));

function createStatusData(overrides: Partial<StatusPageData> = {}): StatusPageData {
  return {
    isAvailable: true,
    indicator: "none",
    indicatorDescription: "All systems operational",
    sourceName: "CodeFight Status",
    publicStatusPageUrl: "https://status.codefight.dev",
    components: [
      {
        id: "frontend",
        name: "Frontend",
        status: "operational",
        description: "App shell",
        group: false,
        showcase: true,
      },
    ],
    incidents: [
      {
        id: "incident-1",
        name: "Queue delay",
        status: "investigating",
        impact: "minor",
        shortlink: "https://status.codefight.dev/incidents/1",
      },
    ],
    ...overrides,
  };
}

describe("views/status/ui/StatusPageView", () => {
  it("renders status page shell and forwards data to child sections", () => {
    const data = createStatusData();
    const { container } = render(<StatusPageView data={data} />);

    expect(screen.getByTestId("status-page-hero")).toBeInTheDocument();
    expect(screen.getByTestId("status-overview-card")).toBeInTheDocument();
    expect(screen.getByTestId("status-components-grid")).toBeInTheDocument();
    expect(screen.getByTestId("status-incidents-section")).toBeInTheDocument();

    expect(statusPageViewMocks.StatusOverviewCard).toHaveBeenCalledWith(
      expect.objectContaining({
        isAvailable: true,
        indicator: "none",
        indicatorDescription: "All systems operational",
        sourceName: "CodeFight Status",
        publicStatusPageUrl: "https://status.codefight.dev",
      }),
    );

    expect(statusPageViewMocks.StatusComponentsGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        components: data.components,
      }),
    );
    expect(statusPageViewMocks.StatusIncidentsSection).toHaveBeenCalledWith(
      expect.objectContaining({
        incidents: data.incidents,
      }),
    );

    expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(4);
  });
});
