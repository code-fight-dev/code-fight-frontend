import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomePage } from "@/views/home/ui/HomePage";

vi.mock("@/shared/ui/AmbientGrid", () => ({
  AmbientGrid: ({ className }: { className?: string }) => (
    <div data-testid="ambient-grid" className={className} />
  ),
}));

vi.mock("@/widgets/hero", () => ({
  Hero: ({ snapshot }: { snapshot: { liveLabel: string } }) => (
    <div data-testid="hero">{snapshot.liveLabel}</div>
  ),
}));

vi.mock("@/widgets/platform-stats", () => ({
  PlatformStats: ({ stats }: { stats: Array<{ id: string }> }) => (
    <div data-testid="platform-stats">{stats.length}</div>
  ),
}));

vi.mock("@/widgets/arena-edge", () => ({
  ArenaEdge: ({ snapshot }: { snapshot: { title: string } }) => (
    <div data-testid="arena-edge">{snapshot.title}</div>
  ),
}));

vi.mock("@/widgets/leaderboard-cta", () => ({
  LeaderboardCta: ({ snapshot }: { snapshot: { actionLabel: string } }) => (
    <div data-testid="leaderboard-cta">{snapshot.actionLabel}</div>
  ),
}));

describe("views/home/ui/HomePage", () => {
  it("renders home sections and passes data snapshots", () => {
    render(
      <HomePage
        data={{
          heroSnapshot: {
            liveLabel: "Live Season",
            queueCount: 42,
            featuredDevelopers: [],
          },
          platformStats: [
            {
              id: "active-players",
              label: "Active Players",
              value: "120K+",
              badge: "+12%",
              badgeTone: "success",
            },
          ],
          arenaEdgeSnapshot: {
            eyebrow: "The Arena Edge",
            title: "Engineered for Competition",
            description: "desc",
            cards: [],
          },
          leaderboardCtaSnapshot: {
            title: "Ready?",
            description: "desc",
            actionLabel: "Start",
            actionHref: "/arena",
          },
        }}
      />,
    );

    expect(screen.getByTestId("ambient-grid")).toBeInTheDocument();
    expect(screen.getByTestId("hero")).toHaveTextContent("Live Season");
    expect(screen.getByTestId("platform-stats")).toHaveTextContent("1");
    expect(screen.getByTestId("arena-edge")).toHaveTextContent(
      "Engineered for Competition",
    );
    expect(screen.getByTestId("leaderboard-cta")).toHaveTextContent("Start");
  });
});
