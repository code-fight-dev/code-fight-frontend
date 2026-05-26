import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StatusPageIncident } from "@/views/status/model/types";
import { StatusIncidentsSection } from "@/views/status/ui/StatusIncidentsSection";

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

function createIncident(overrides: Partial<StatusPageIncident> = {}): StatusPageIncident {
  return {
    id: "incident-1",
    name: "Realtime queue delays",
    status: "investigating",
    impact: "minor",
    shortlink: "https://status.example.com/incidents/1",
    ...overrides,
  };
}

describe("views/status/ui/StatusIncidentsSection", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "disabled";
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
  });

  it("returns null when there are no active incidents", () => {
    const { container } = render(<StatusIncidentsSection incidents={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders incident links for active incidents", () => {
    render(
      <StatusIncidentsSection
        incidents={[
          createIncident(),
          createIncident({
            id: "incident-2",
            name: "Judge latency",
            status: "identified",
            impact: "major",
            shortlink: "https://status.example.com/incidents/2",
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Active incidents", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Realtime queue delays/i })).toHaveAttribute(
      "href",
      "https://status.example.com/incidents/1",
    );
    expect(screen.getByText(/investigating\s*·\s*minor/)).toBeInTheDocument();
    expect(screen.getByText(/identified\s*·\s*major/)).toBeInTheDocument();
  });
});
