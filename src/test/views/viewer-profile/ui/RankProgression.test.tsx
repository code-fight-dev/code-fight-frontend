import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RankProgression } from "@/views/viewer-profile/ui/RankProgression";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("views/viewer-profile/ui/RankProgression", () => {
  it("renders next-rank progress with world and regional rankings", () => {
    render(
      <RankProgression
        rating={1500}
        country="United States"
        countryCode="US"
        globalRank={101}
        globalPlayersCount={5000}
        regionalRank={10}
        regionalPlayersCount={400}
      />,
    );

    expect(screen.getByText("1,500 Elo")).toBeInTheDocument();
    expect(screen.getByText("250 Elo to B")).toBeInTheDocument();
    expect(screen.getByText("To B-tier")).toBeInTheDocument();
    expect(screen.getByText("250 Elo needed")).toBeInTheDocument();
    expect(screen.getByText("World Ranking")).toBeInTheDocument();
    expect(screen.getByText("#101")).toBeInTheDocument();
    expect(screen.getByText("Regional Ranking")).toBeInTheDocument();
    expect(screen.getByText("#10")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open ranking guide/i })).toHaveAttribute(
      "href",
      "/ranking",
    );
    expect(document.querySelector('[title="United States"]')).toBeInTheDocument();
  });

  it("renders max-tier copy and hides ranking cards when ranks are unresolved", () => {
    render(
      <RankProgression
        rating={2300}
        country=""
        countryCode=""
        globalRank={null}
        globalPlayersCount={null}
        regionalRank={null}
        regionalPlayersCount={null}
      />,
    );

    expect(screen.getAllByText("Top tier reached")).toHaveLength(2);
    expect(screen.getByText("Max tier")).toBeInTheDocument();
    expect(screen.queryByText("World Ranking")).not.toBeInTheDocument();
    expect(screen.queryByText("Regional Ranking")).not.toBeInTheDocument();
  });

  it("falls back to regional icon when flag cannot be resolved", () => {
    render(
      <RankProgression
        rating={1700}
        country="Atlantis"
        countryCode=""
        globalRank={null}
        globalPlayersCount={null}
        regionalRank={5}
        regionalPlayersCount={200}
      />,
    );

    expect(screen.getByText("Regional Ranking")).toBeInTheDocument();
    expect(screen.getByText("#5")).toBeInTheDocument();
    expect(document.querySelector('[title="Atlantis"]')).not.toBeInTheDocument();
  });
});
