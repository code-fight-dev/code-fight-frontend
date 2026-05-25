import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeaderboardSearchInput } from "@/features/leaderboard-navigation/ui/LeaderboardSearchInput";

describe("features/leaderboard-navigation/ui/LeaderboardSearchInput", () => {
  it("renders controlled query value and emits onQueryChange", () => {
    const onQueryChange = vi.fn();

    render(<LeaderboardSearchInput query="alice" onQueryChange={onQueryChange} />);

    const input = screen.getByRole("textbox", { name: "Search player" });
    expect(input).toHaveValue("alice");
    expect(input).toHaveAttribute("placeholder", "Search player");

    fireEvent.change(input, { target: { value: "bob" } });
    expect(onQueryChange).toHaveBeenCalledWith("bob");
  });
});
