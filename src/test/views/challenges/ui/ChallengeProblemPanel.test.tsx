import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TaskSubmissionSummary } from "@/entities/challenge";
import { createChallengeFixture } from "@/test/fixtures/challenge";
import { ChallengeProblemPanel } from "@/views/challenges/ui/ChallengeProblemPanel";

function createSubmission(
  overrides: Partial<TaskSubmissionSummary> = {},
): TaskSubmissionSummary {
  return {
    id: "submission-1",
    createdAt: "2026-05-26T10:00:00.000Z",
    language: "typescript",
    status: "sent_to_judge",
    verdict: "wrong_answer",
    passedTests: 2,
    totalTests: 5,
    runTimeMs: 32,
    ...overrides,
  };
}

describe("views/challenges/ui/ChallengeProblemPanel", () => {
  it("renders description tab content and notes", () => {
    const onTabChange = vi.fn();
    const challenge = createChallengeFixture({
      kind: "sql",
      examples: [
        {
          title: "Simple aggregation",
          input: "SELECT COUNT(*) FROM users;",
          output: "42",
          explanation: "Counts all rows.",
        },
      ],
      constraints: ["1 <= rows <= 10^5"],
      notes: ["Indexes can improve performance."],
      description: ["Line A", "Line B"],
    });

    render(
      <ChallengeProblemPanel
        challenge={challenge}
        activeTab="description"
        submissions={[]}
        onTabChange={onTabChange}
      />,
    );

    expect(
      screen.getByRole("heading", { name: challenge.title, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(challenge.summary)).toBeInTheDocument();
    expect(screen.getAllByText("SQL")).toHaveLength(2);
    expect(screen.getByText("Line A")).toBeInTheDocument();
    expect(screen.getByText("Line B")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Example 1: Simple aggregation", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 <= rows <= 10^5")).toBeInTheDocument();
    expect(screen.getByText("Indexes can improve performance.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Editorial" }));
    expect(onTabChange).toHaveBeenCalledWith("editorial");
  });

  it("renders editorial placeholder", () => {
    render(
      <ChallengeProblemPanel
        challenge={createChallengeFixture()}
        activeTab="editorial"
        submissions={[]}
        onTabChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Editorial locked", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Solve the problem first, then compare approaches, edge cases, and complexity notes here.",
      ),
    ).toBeInTheDocument();
  });

  it("omits notes section when challenge notes are empty", () => {
    render(
      <ChallengeProblemPanel
        challenge={createChallengeFixture({
          notes: [],
        })}
        activeTab="description"
        submissions={[]}
        onTabChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "Notes", level: 2 }),
    ).not.toBeInTheDocument();
  });

  it("renders submissions placeholder for empty history", () => {
    render(
      <ChallengeProblemPanel
        challenge={createChallengeFixture()}
        activeTab="submissions"
        submissions={[]}
        onTabChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "No submissions yet", level: 2 }),
    ).toBeInTheDocument();
  });

  it("renders submission cards with readable labels and fallback runtime/date", () => {
    render(
      <ChallengeProblemPanel
        challenge={createChallengeFixture()}
        activeTab="submissions"
        submissions={[
          createSubmission(),
          createSubmission({
            id: "submission-2",
            createdAt: "invalid-date",
            language: "python",
            status: "failed",
            verdict: undefined,
            runTimeMs: undefined,
            errorMessage: "Compilation failed",
          }),
        ]}
        onTabChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Sent To Judge")).toBeInTheDocument();
    expect(screen.getByText("Wrong Answer")).toBeInTheDocument();
    expect(screen.getAllByText("2/5")).toHaveLength(2);
    expect(screen.getByText("32 ms")).toBeInTheDocument();

    expect(screen.getByText("invalid-date")).toBeInTheDocument();
    expect(screen.getByText("PYTHON")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("n/a")).toBeInTheDocument();
    expect(screen.getByText("Compilation failed")).toBeInTheDocument();
  });
});
