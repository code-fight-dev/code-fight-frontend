import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/status/page", () => {
  it("loads status data and renders status view", async () => {
    const statusData = {
      service: "frontend",
      healthy: true,
    };

    const getStatusPageDataMock = vi.fn().mockResolvedValue(statusData);
    const StatusPageViewMock = vi.fn(({ data }: { data: unknown }) => (
      <div data-testid="status-page-view">{JSON.stringify(data)}</div>
    ));

    const { default: StatusPage, metadata } = await loadPageModule(
      () => import("@/app/status/page"),
      () => {
        vi.doMock("@/views/status/server", () => ({
          getStatusPageData: getStatusPageDataMock,
        }));
        vi.doMock("@/views/status", () => ({
          StatusPageView: StatusPageViewMock,
        }));
      },
    );
    const element = await StatusPage();

    render(element);

    expect(getStatusPageDataMock).toHaveBeenCalledTimes(1);
    expect(getFirstCallProps(StatusPageViewMock)).toEqual({
      data: statusData,
    });
    expect(screen.getByTestId("status-page-view")).toHaveTextContent(
      '"service":"frontend"',
    );
    expect(metadata).toEqual({
      title: "Status | CodeFight",
      description:
        "Current availability, incidents, and uptime information for CodeFight services.",
      alternates: {
        canonical: "/status",
      },
    });
  });
});
