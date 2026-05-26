import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArenaRoomProblemPanel } from "@/views/arena-match-room/ui/ArenaRoomProblemPanel";
import { createChallengeFixture } from "@/test/fixtures/challenge";

describe("views/arena-match-room/ui/ArenaRoomProblemPanel", () => {
  it("renders challenge headline, description, examples and constraints", () => {
    const challenge = createChallengeFixture({
      title: "Two Sum",
      summary: "Find indices of two values that add up to target.",
      description: ["Use a map for complements.", "Return stable index order."],
      examples: [
        {
          title: "Basic pair",
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "2 + 7 equals 9.",
        },
      ],
      constraints: ["2 <= nums.length <= 1e5", "-1e9 <= nums[i] <= 1e9"],
    });

    render(<ArenaRoomProblemPanel challenge={challenge} />);

    expect(
      screen.getByRole("heading", { name: "Two Sum", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Find indices of two values that add up to target."),
    ).toBeInTheDocument();
    expect(screen.getByText("Use a map for complements.")).toBeInTheDocument();
    expect(screen.getByText("Return stable index order.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Examples", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Example 1: Basic pair", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Input: nums = [2,7,11,15], target = 9")).toBeInTheDocument();
    expect(screen.getByText("Output: [0,1]")).toBeInTheDocument();
    expect(screen.getByText("2 + 7 equals 9.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Constraints", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 <= nums.length <= 1e5")).toBeInTheDocument();
    expect(screen.getByText("-1e9 <= nums[i] <= 1e9")).toBeInTheDocument();
  });

  it("hides explanation text when example explanation is missing", () => {
    const challenge = createChallengeFixture({
      description: [],
      examples: [
        {
          title: "No explanation",
          input: "input",
          output: "output",
        },
      ],
      constraints: [],
    });

    render(<ArenaRoomProblemPanel challenge={challenge} />);

    expect(
      screen.getByRole("heading", { name: "Example 1: No explanation", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^2 \+ 7 equals 9\.$/)).not.toBeInTheDocument();
  });
});
