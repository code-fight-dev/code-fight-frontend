import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ChallengeProgressStatus } from "@/views/challenges/ui/ChallengeProgressStatus";
import { ChallengeTag } from "@/views/challenges/ui/ChallengeTag";
import { ChallengesPageHero } from "@/views/challenges/ui/ChallengesPageHero";
import { ChallengesPageStats } from "@/views/challenges/ui/ChallengesPageStats";
import { ChallengesResultsSummary } from "@/views/challenges/ui/ChallengesResultsSummary";
import { ConstraintList } from "@/views/challenges/ui/ConstraintList";
import { DifficultyBadge } from "@/views/challenges/ui/DifficultyBadge";
import { ExampleBlock } from "@/views/challenges/ui/ExampleBlock";

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

describe("views/challenges/ui basic components", () => {
  it("renders difficulty badge with difficulty class and custom class", () => {
    render(<DifficultyBadge difficulty="Hard" className="custom-badge" />);

    const badge = screen.getByText("Hard");
    expect(badge).toHaveClass("challenge-difficulty-hard");
    expect(badge).toHaveClass("custom-badge");
  });

  it("renders challenge tag label", () => {
    render(<ChallengeTag className="custom-tag">Array</ChallengeTag>);

    const tag = screen.getByText("Array");
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass("custom-tag");
  });

  it("renders solved progress icon and hides non-solved states", () => {
    const { rerender } = render(<ChallengeProgressStatus progress="solved" />);
    expect(screen.getByLabelText("Solved")).toBeInTheDocument();

    rerender(<ChallengeProgressStatus progress="in-progress" />);
    expect(screen.queryByLabelText("Solved")).not.toBeInTheDocument();
  });

  it("renders constraints list and examples with optional explanation", () => {
    const { rerender } = render(
      <>
        <ConstraintList constraints={["1 <= n <= 1000", "Input is sorted"]} />
        <ExampleBlock
          index={0}
          example={{
            title: "Simple case",
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "nums[0] + nums[1] = 9",
          }}
        />
      </>,
    );

    expect(
      screen.getByRole("heading", { name: "Constraints", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 <= n <= 1000")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Example 1: Simple case", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("nums[0] + nums[1] = 9")).toBeInTheDocument();

    rerender(
      <ExampleBlock
        index={1}
        example={{
          title: "No explanation",
          input: "x",
          output: "y",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Example 2: No explanation", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.queryByText("nums[0] + nums[1] = 9")).not.toBeInTheDocument();
  });

  it("renders page hero and stats cards", () => {
    render(
      <>
        <ChallengesPageHero />
        <ChallengesPageStats totalChallenges={120} solvedCount={37} activeCount={8} />
      </>,
    );

    expect(screen.getAllByText("Solo practice")).toHaveLength(2);
    expect(
      screen.getByRole("heading", { name: "Challenges", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Arena/i })).toHaveAttribute(
      "href",
      "/arena",
    );
    expect(screen.getByText("120 problems")).toBeInTheDocument();
    expect(screen.getByText("37 completed")).toBeInTheDocument();
    expect(screen.getByText("8 in progress")).toBeInTheDocument();
  });

  it("renders filtered/total summary", () => {
    render(<ChallengesResultsSummary filteredCount={14} totalCount={120} />);

    expect(
      screen.getByRole("heading", { name: "Problem set", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("14 of 120 challenges")).toBeInTheDocument();
    expect(screen.getByText("Sorted by your current practice plan.")).toBeInTheDocument();
  });
});
