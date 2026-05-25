import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PlayerIdentity } from "@/entities/leaderboard";
import type { LeaderboardEntry } from "@/entities/leaderboard";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    title,
    className,
  }: {
    children: ReactNode;
    href: string;
    title?: string;
    className?: string;
  }) => (
    <a className={className} href={href} title={title}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}));

function createEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    rank: 1,
    userId: "user-alice",
    username: "alice",
    displayName: "Alice",
    avatarUrl: "",
    country: "United States",
    countryCode: "US",
    rating: 1600,
    ratedGames: 20,
    wins: 10,
    losses: 8,
    draws: 2,
    winRate: 0.5,
    ...overrides,
  };
}

describe("PlayerIdentity", () => {
  it("renders profile link and username line", () => {
    const entry = createEntry();

    render(<PlayerIdentity entry={entry} />);

    const link = screen.getByRole("link", { name: "Alice" });
    expect(link).toHaveAttribute("href", "/u/alice");
    expect(link).toHaveAttribute("title", "Alice");
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });

  it("shows viewer badge, country flag and location in meta line", () => {
    const entry = createEntry({
      country: "United States",
      countryCode: "US",
    });

    render(<PlayerIdentity entry={entry} isViewer />);

    expect(screen.getByText("you")).toBeInTheDocument();
    expect(screen.getByTitle("United States")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
  });

  it("hides username and meta line when values are empty", () => {
    const entry = createEntry({
      username: "   ",
      country: "   ",
      countryCode: "   ",
    });

    render(<PlayerIdentity entry={entry} />);

    expect(screen.queryByText(/^@/)).not.toBeInTheDocument();
    expect(screen.queryByText("you")).not.toBeInTheDocument();
    expect(screen.queryByText("United States")).not.toBeInTheDocument();
  });

  it("renders meta line for viewer without country flag and location", () => {
    const entry = createEntry({
      country: "   ",
      countryCode: "   ",
    });

    render(<PlayerIdentity entry={entry} isViewer />);

    expect(screen.getByText("you")).toBeInTheDocument();
    expect(screen.queryByTitle("United States")).not.toBeInTheDocument();
    expect(screen.queryByText("United States")).not.toBeInTheDocument();
  });
});
