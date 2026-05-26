import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { StatusPageComponent } from "@/views/status/model/types";
import { StatusComponentsGrid } from "@/views/status/ui/StatusComponentsGrid";

function createComponent(
  overrides: Partial<StatusPageComponent> = {},
): StatusPageComponent {
  return {
    id: "component-1",
    name: "Frontend",
    status: "operational",
    description: "Frontend API and websocket gateway.",
    group: false,
    showcase: true,
    ...overrides,
  };
}

describe("views/status/ui/StatusComponentsGrid", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "disabled";
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
  });

  it("renders empty state when no components are provided", () => {
    render(<StatusComponentsGrid components={[]} />);

    expect(
      screen.getByText("No component status information available."),
    ).toBeInTheDocument();
  });

  it("renders component cards with status badges and optional descriptions", () => {
    render(
      <StatusComponentsGrid
        components={[
          createComponent(),
          createComponent({
            id: "component-2",
            name: "Judge Queue",
            status: "major_outage",
            description: null,
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Frontend", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Frontend API and websocket gateway.")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Judge Queue", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Major outage")).toBeInTheDocument();
    expect(screen.queryByText("null")).not.toBeInTheDocument();
  });
});
