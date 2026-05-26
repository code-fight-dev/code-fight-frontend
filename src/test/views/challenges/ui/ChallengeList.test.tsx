import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ChallengeListItem } from "@/entities/challenge";
import { ChallengeList } from "@/views/challenges/ui/ChallengeList";

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

function createChallenge(overrides: Partial<ChallengeListItem> = {}): ChallengeListItem {
  return {
    id: "challenge-1",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    summary: "Find pair with target sum",
    tags: ["Array", "Hash Table"],
    category: "Algorithms",
    kind: "algorithmic",
    supportedLanguages: ["typescript", "python"],
    acceptanceRate: 61,
    estimatedMinutes: 15,
    attempts: 1200,
    popularity: 4000,
    createdAt: "2026-05-20T00:00:00.000Z",
    progress: "solved",
    ...overrides,
  };
}

describe("views/challenges/ui/ChallengeList", () => {
  it("renders empty state when challenges list is empty", () => {
    render(<ChallengeList challenges={[]} />);

    expect(
      screen.getByRole("heading", { name: "No challenges found", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Try clearing a filter or broadening the search terms."),
    ).toBeInTheDocument();
  });

  it("renders challenge rows/cards with metadata and links", () => {
    render(
      <ChallengeList
        challenges={[
          createChallenge(),
          createChallenge({
            id: "challenge-2",
            slug: "sql-report",
            title: "SQL Report",
            difficulty: "Hard",
            acceptanceRate: 48,
            kind: "sql",
            supportedLanguages: ["sql"],
            attempts: 999,
            progress: "in-progress",
            tags: ["Aggregation"],
          }),
        ]}
      />,
    );

    expect(screen.getAllByRole("heading", { name: "Two Sum", level: 3 })).toHaveLength(2);
    expect(screen.getAllByRole("heading", { name: "SQL Report", level: 3 })).toHaveLength(
      2,
    );
    expect(screen.getAllByText("1.2k attempts")).toHaveLength(2);
    expect(screen.getAllByText("999 attempts")).toHaveLength(2);
    expect(screen.getAllByText("61%")).toHaveLength(2);
    expect(screen.getAllByText("Easy")).toHaveLength(2);
    expect(screen.getAllByText("Hard")).toHaveLength(2);
    expect(screen.getAllByLabelText("Solved")).toHaveLength(2);

    const links = screen.getAllByRole("link");
    expect(
      links.some((link) => link.getAttribute("href") === "/challenges/two-sum"),
    ).toBe(true);
    expect(
      links.some((link) => link.getAttribute("href") === "/challenges/sql-report"),
    ).toBe(true);
  });
});
