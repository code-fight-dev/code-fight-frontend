import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArenaRoomScoreStrip } from "@/views/arena-match-room/ui/ArenaRoomScoreStrip";

describe("views/arena-match-room/ui/ArenaRoomScoreStrip", () => {
  it("renders score, attempts and solving states", () => {
    render(
      <ArenaRoomScoreStrip
        selfScore={3}
        opponentScore={2}
        selfAttempts={4}
        opponentAttempts={5}
        selfSolved
        opponentSolved={false}
      />,
    );

    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("3 : 2")).toBeInTheDocument();
    expect(screen.getByText("Attempts")).toBeInTheDocument();
    expect(screen.getByText("4 : 5")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Solved")).toBeInTheDocument();
    expect(screen.getByText("Opponent")).toBeInTheDocument();
    expect(screen.getByText("Solving")).toBeInTheDocument();
  });

  it("renders opposite solving states", () => {
    render(
      <ArenaRoomScoreStrip
        selfScore={0}
        opponentScore={0}
        selfAttempts={0}
        opponentAttempts={0}
        selfSolved={false}
        opponentSolved
      />,
    );

    expect(screen.getAllByText("Solving")).toHaveLength(1);
    expect(screen.getAllByText("Solved")).toHaveLength(1);
  });
});
