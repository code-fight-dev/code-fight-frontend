import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeaderboardJumpToMeButton } from "@/features/leaderboard-focus/ui/LeaderboardJumpToMeButton";

describe("features/leaderboard-focus/ui/LeaderboardJumpToMeButton", () => {
  it("renders button and calls click handler", () => {
    const onClick = vi.fn();

    render(<LeaderboardJumpToMeButton onClick={onClick} />);

    const button = screen.getByRole("button", { name: "Jump to me" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
