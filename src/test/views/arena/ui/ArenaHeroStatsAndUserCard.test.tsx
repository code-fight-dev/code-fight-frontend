import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArenaHero } from "@/views/arena/ui/ArenaHero";
import { ArenaStatsCards } from "@/views/arena/ui/ArenaStatsCards";
import { ArenaUserCard } from "@/views/arena/ui/ArenaUserCard";

describe("views/arena/ui/ArenaHero", () => {
  it("renders arena hero copy", () => {
    render(<ArenaHero />);

    expect(screen.getByText("PVP Matchmaking")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Arena", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Queue into a fair, ELO-balanced duel. Lock in ready, accept the match, and solve the same problem head-to-head.",
      ),
    ).toBeInTheDocument();
  });
});

describe("views/arena/ui/ArenaStatsCards", () => {
  it("renders fallback values when stats are missing", () => {
    render(<ArenaStatsCards stats={null} />);

    expect(screen.getByText("Matches")).toBeInTheDocument();
    expect(screen.getByText("Win Rate")).toBeInTheDocument();
    expect(screen.getByText("Wins")).toBeInTheDocument();
    expect(screen.getByText("0 streak")).toBeInTheDocument();
  });

  it("renders provided arena stats", () => {
    render(
      <ArenaStatsCards
        stats={{
          totalMatches: 52,
          winRate: 0.734,
          wins: 38,
          maxWinStreak: 7,
        }}
      />,
    );

    expect(screen.getByText("52")).toBeInTheDocument();
    expect(screen.getByText("73%")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument();
    expect(screen.getByText("7 streak")).toBeInTheDocument();
  });
});

describe("views/arena/ui/ArenaUserCard", () => {
  it("renders guest presentation for anonymous viewer", () => {
    render(
      <ArenaUserCard
        viewer={{
          username: null,
          avatarUrl: "",
          eloRating: null,
          globalRank: null,
          tier: null,
        }}
        isGuest
      />,
    );

    expect(screen.getAllByText("Guest")).toHaveLength(2);
    expect(screen.getByText("Read-only preview mode")).toBeInTheDocument();
  });

  it("renders ranked viewer details", () => {
    render(
      <ArenaUserCard
        viewer={{
          username: "lyosh",
          avatarUrl: "",
          eloRating: 1420,
          globalRank: 17,
          tier: "A",
        }}
        isGuest={false}
      />,
    );

    expect(screen.getByText("lyosh")).toBeInTheDocument();
    expect(screen.getByText("Tier A")).toBeInTheDocument();
    expect(screen.getByText(/ELO 1,420/)).toBeInTheDocument();
    expect(screen.getByText(/Global #17/)).toBeInTheDocument();
  });
});
