import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ArenaMatchFinishedOverlay } from "@/views/arena-match-room/ui/ArenaMatchFinishedOverlay";
import { createArenaMatchFixture } from "@/test/features/arena-room/model/fixtures";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("views/arena-match-room/ui/ArenaMatchFinishedOverlay", () => {
  it("renders winner outcome for current viewer with signed rating delta", () => {
    const match = createArenaMatchFixture({
      status: "finished",
      resultType: "player1_win",
      winnerId: "viewer-1",
      winningReason: "surrender",
      player1Score: 100,
      player2Score: 85,
      player1RatingDelta: 16,
      player2RatingDelta: -16,
      isRated: true,
    });

    render(<ArenaMatchFinishedOverlay match={match} viewerId="viewer-1" />);

    expect(
      screen.getByRole("heading", { name: "You won the match", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Victory")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Opponent surrendered")).toBeInTheDocument();
    expect(screen.getByText("100 : 85")).toBeInTheDocument();
    expect(screen.getByText("+16 ELO")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leave match room" })).toHaveAttribute(
      "href",
      "/arena",
    );
  });

  it("renders draw outcome and pending rating update for non-participant viewers", () => {
    const match = createArenaMatchFixture({
      status: "finished",
      resultType: "draw",
      winnerId: undefined,
      winningReason: "draw",
      isRated: true,
    });

    render(<ArenaMatchFinishedOverlay match={match} viewerId="viewer-3" />);

    expect(
      screen.getByRole("heading", { name: "Match ended in a draw", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Draw")).toBeInTheDocument();
    expect(screen.getByText("No winner")).toBeInTheDocument();
    expect(screen.getByText("Draw by equal result")).toBeInTheDocument();
    expect(screen.getByText("Rating update pending")).toBeInTheDocument();
  });

  it("renders defeat surrender reason and unrated label", () => {
    const match = createArenaMatchFixture({
      status: "finished",
      resultType: "player2_win",
      winnerId: "viewer-2",
      winningReason: "surrender",
      isRated: false,
    });

    render(<ArenaMatchFinishedOverlay match={match} viewerId="viewer-1" />);

    expect(
      screen.getByRole("heading", { name: "Opponent won the match", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Defeat")).toBeInTheDocument();
    expect(screen.getByText("Opponent")).toBeInTheDocument();
    expect(screen.getByText("You surrendered")).toBeInTheDocument();
    expect(screen.getByText("Unrated match")).toBeInTheDocument();
  });
});
