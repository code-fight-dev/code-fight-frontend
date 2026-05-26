import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ViewerProfileRecentMatch } from "@/entities/viewer";
import { RecentMatchesMobileList } from "@/views/viewer-profile/ui/recent-matches/RecentMatchesMobileList";

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
    id: "match-mobile-1",
    result: "draw",
    opponent: {
      id: "opponent-1",
      username: "nova",
      displayName: "Nova",
      avatarUrl: "",
    },
    difficulty: "hard",
    eloDelta: 0,
    isRated: true,
    finishedAt: "2026-05-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("views/viewer-profile/ui/recent-matches/RecentMatchesMobileList", () => {
  it("renders mobile rows with profile, details and full-width replay link", () => {
    render(
      <RecentMatchesMobileList
        matches={[
          createMatch(),
          createMatch({
            id: "match-mobile-2",
            opponent: {
              id: "opponent-2",
              username: "echo",
              displayName: "",
              avatarUrl: "",
            },
            isRated: false,
            eloDelta: null,
            difficulty: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText("Nova")).toBeInTheDocument();
    expect(screen.getByText("echo")).toBeInTheDocument();
    expect(screen.getByText("@nova")).toBeInTheDocument();
    expect(screen.getByText("@echo")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Unrated")).toBeInTheDocument();

    const replayLinks = screen.getAllByRole("link", { name: "Open Replay" });
    expect(replayLinks[0]).toHaveAttribute("href", "/arena/replay/match-mobile-1");
    expect(replayLinks[1]).toHaveAttribute("href", "/arena/replay/match-mobile-2");
    expect(replayLinks[0]).toHaveClass("w-full");
  });
});
