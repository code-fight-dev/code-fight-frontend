import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DocsPageData } from "@/views/docs/model/types";

vi.mock("lucide-react", () => ({
  BookOpenText: () => <svg aria-hidden data-testid="book-open-icon" />,
}));

vi.mock("@/shared/ui/Button", () => ({
  Button: ({
    children,
    href,
    variant,
  }: {
    children: ReactNode;
    href: string;
    variant?: string;
  }) => (
    <a data-variant={variant ?? "primary"} href={href}>
      {children}
    </a>
  ),
}));

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className} data-testid="reveal">
      {children}
    </div>
  ),
}));

import { DocsHero } from "@/views/docs/ui/DocsHero";

const docsPageData = {
  updatedAtLabel: "May 25, 2026",
  heroMetrics: [
    {
      value: "8",
      label: "Core guides",
      caption: "Learn platform fundamentals.",
    },
    {
      value: "4",
      label: "API sections",
      caption: "Connect external tools.",
    },
    {
      value: "24/7",
      label: "Status visibility",
      caption: "Monitor platform health.",
    },
  ],
} as unknown as DocsPageData;

describe("views/docs/ui/DocsHero", () => {
  it("renders the docs hero content and primary actions", () => {
    render(<DocsHero data={docsPageData} />);

    expect(screen.getByTestId("reveal")).toBeTruthy();
    expect(screen.getByTestId("book-open-icon")).toBeTruthy();

    expect(screen.getByText("Documentation")).toBeTruthy();
    expect(screen.getByText("CodeFight Platform")).toBeTruthy();
    expect(screen.getByText("Documentation Center")).toBeTruthy();
    expect(screen.getByText("May 25, 2026")).toBeTruthy();

    expect(
      screen.getByText(/Product guides, integration details, and lifecycle behavior/i),
    ).toBeTruthy();

    expect(screen.getByRole("link", { name: "Explore Challenges" })).toHaveAttribute(
      "href",
      "/challenges",
    );

    expect(screen.getByRole("link", { name: "Check System Status" })).toHaveAttribute(
      "href",
      "/status",
    );

    expect(screen.getByRole("link", { name: "Explore Challenges" })).toHaveAttribute(
      "data-variant",
      "primary",
    );

    expect(screen.getByRole("link", { name: "Check System Status" })).toHaveAttribute(
      "data-variant",
      "secondary",
    );
  });

  it("renders all hero metrics", () => {
    render(<DocsHero data={docsPageData} />);

    expect(screen.getByText("8")).toBeTruthy();
    expect(screen.getByText("Core guides")).toBeTruthy();
    expect(screen.getByText("Learn platform fundamentals.")).toBeTruthy();

    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("API sections")).toBeTruthy();
    expect(screen.getByText("Connect external tools.")).toBeTruthy();

    expect(screen.getByText("24/7")).toBeTruthy();
    expect(screen.getByText("Status visibility")).toBeTruthy();
    expect(screen.getByText("Monitor platform health.")).toBeTruthy();
  });
});
