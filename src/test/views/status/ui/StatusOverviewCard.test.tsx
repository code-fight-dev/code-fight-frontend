import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StatusOverviewCard } from "@/views/status/ui/StatusOverviewCard";

vi.mock("next/link", () => ({
  default: ({
    href,
    target,
    rel,
    children,
    className,
  }: {
    href: string;
    target?: string;
    rel?: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} target={target} rel={rel} className={className}>
      {children}
    </a>
  ),
}));

describe("views/status/ui/StatusOverviewCard", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "disabled";
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
  });

  it("shows unavailable source label when status data cannot be fetched", () => {
    render(
      <StatusOverviewCard
        isAvailable={false}
        indicator="major"
        indicatorDescription="Status information is currently unavailable."
        sourceName={null}
        publicStatusPageUrl={null}
      />,
    );

    expect(
      screen.getAllByText("Status information is currently unavailable."),
    ).toHaveLength(2);
    expect(
      screen.queryByRole("link", { name: "Open public status page" }),
    ).not.toBeInTheDocument();
  });

  it("renders source label and public status page link when available", () => {
    render(
      <StatusOverviewCard
        isAvailable
        indicator="minor"
        indicatorDescription="Minor incident in progress."
        sourceName="CodeFight Status"
        publicStatusPageUrl="https://status.codefight.dev"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Minor incident in progress.", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Source: CodeFight Status")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open public status page" })).toHaveAttribute(
      "href",
      "https://status.codefight.dev",
    );
  });

  it("falls back to indicator label and missing-source copy", () => {
    render(
      <StatusOverviewCard
        isAvailable
        indicator="critical"
        indicatorDescription=""
        sourceName={null}
        publicStatusPageUrl={null}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Critical Service Outage", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Source is not provided by status service."),
    ).toBeInTheDocument();
  });
});
