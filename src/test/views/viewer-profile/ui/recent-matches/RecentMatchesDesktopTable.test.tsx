import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ViewerProfileRecentMatch } from "@/entities/viewer";
import { RecentMatchesDesktopTable } from "@/views/viewer-profile/ui/recent-matches/RecentMatchesDesktopTable";

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

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}));

function createMatch(
  overrides: Partial<ViewerProfileRecentMatch> = {},
): ViewerProfileRecentMatch {
  return {
    id: "match-1",
    result: "win",
    opponent: {
      id: "opponent-1",
      username: "rival",
      displayName: "Rival Name",
      avatarUrl: "",
    },
    difficulty: "medium",
    eloDelta: 14,
    isRated: true,
    finishedAt: "2026-05-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("views/viewer-profile/ui/recent-matches/RecentMatchesDesktopTable", () => {
  it("renders desktop rows with opponent and replay links", () => {
    render(
      <RecentMatchesDesktopTable
        matches={[
          createMatch(),
          createMatch({
            id: "match-2",
            result: "loss",
            opponent: {
              id: "opponent-2",
              username: "shadow",
              displayName: "",
              avatarUrl: "",
            },
            difficulty: null,
            eloDelta: -9,
          }),
        ]}
      />,
    );

    expect(screen.getByText("Rival Name")).toBeInTheDocument();
    expect(screen.getByText("shadow")).toBeInTheDocument();
    expect(screen.getByText(/@rival\s*-/)).toBeInTheDocument();
    expect(screen.getByText(/@shadow\s*-/)).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("+14")).toBeInTheDocument();
    expect(screen.getByText("-9")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: "Open Replay" });
    expect(links[0]).toHaveAttribute("href", "/arena/replay/match-1");
    expect(links[1]).toHaveAttribute("href", "/arena/replay/match-2");

    expect(screen.getByRole("link", { name: /Rival Name/i })).toHaveAttribute(
      "href",
      "/u/rival",
    );
    expect(screen.getByRole("link", { name: /shadow/i })).toHaveAttribute(
      "href",
      "/u/shadow",
    );
  });
});
