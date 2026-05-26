import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ViewerProfileRecentMatch } from "@/entities/viewer";
import {
  DESKTOP_EMPTY_COPY,
  MOBILE_EMPTY_COPY,
  RECENT_MATCH_COLUMNS,
} from "@/views/viewer-profile/ui/recent-matches/constants";
import { RecentMatches } from "@/views/viewer-profile/ui/RecentMatches";

const recentMatchesMocks = vi.hoisted(() => ({
  RecentMatchesColumnPills: vi.fn(),
  RecentMatchesMobileList: vi.fn(),
  RecentMatchesDesktopTable: vi.fn(),
  RecentMatchesEmptyState: vi.fn(),
}));

vi.mock("@/views/viewer-profile/ui/recent-matches/RecentMatchesColumnPills", () => ({
  RecentMatchesColumnPills: () => {
    recentMatchesMocks.RecentMatchesColumnPills();
    return <div data-testid="recent-matches-column-pills">pills</div>;
  },
}));

vi.mock("@/views/viewer-profile/ui/recent-matches/RecentMatchesMobileList", () => ({
  RecentMatchesMobileList: (props: Record<string, unknown>) => {
    recentMatchesMocks.RecentMatchesMobileList(props);
    return <div data-testid="recent-matches-mobile-list">mobile-list</div>;
  },
}));

vi.mock("@/views/viewer-profile/ui/recent-matches/RecentMatchesDesktopTable", () => ({
  RecentMatchesDesktopTable: (props: Record<string, unknown>) => {
    recentMatchesMocks.RecentMatchesDesktopTable(props);
    return <div data-testid="recent-matches-desktop-table">desktop-table</div>;
  },
}));

vi.mock("@/views/viewer-profile/ui/recent-matches/RecentMatchesEmptyState", () => ({
  RecentMatchesEmptyState: (props: Record<string, unknown>) => {
    recentMatchesMocks.RecentMatchesEmptyState(props);
    return <div data-testid="recent-matches-empty-state">empty-state</div>;
  },
}));

function createMatch(
  overrides: Partial<ViewerProfileRecentMatch> = {},
): ViewerProfileRecentMatch {
  return {
    id: "match-1",
    result: "win",
    opponent: {
      id: "opponent-1",
      username: "bob",
      displayName: "Bob",
      avatarUrl: "",
    },
    difficulty: "medium",
    eloDelta: 14,
    isRated: true,
    finishedAt: "2026-05-24T12:00:00.000Z",
    ...overrides,
  };
}

describe("views/viewer-profile/ui/RecentMatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders mobile and desktop empty states when no matches are provided", () => {
    render(<RecentMatches matches={[]} />);

    expect(screen.getByRole("heading", { name: "Recent Matches" })).toBeInTheDocument();
    expect(recentMatchesMocks.RecentMatchesColumnPills).toHaveBeenCalledTimes(1);

    expect(recentMatchesMocks.RecentMatchesEmptyState).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ description: MOBILE_EMPTY_COPY }),
    );
    expect(recentMatchesMocks.RecentMatchesEmptyState).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ description: DESKTOP_EMPTY_COPY }),
    );

    expect(recentMatchesMocks.RecentMatchesMobileList).not.toHaveBeenCalled();
    expect(recentMatchesMocks.RecentMatchesDesktopTable).not.toHaveBeenCalled();

    for (const column of RECENT_MATCH_COLUMNS) {
      expect(screen.getByText(column)).toBeInTheDocument();
    }
  });

  it("renders mobile and desktop lists when matches exist", () => {
    const matches = [createMatch(), createMatch({ id: "match-2", result: "loss" })];

    render(<RecentMatches matches={matches} />);

    expect(recentMatchesMocks.RecentMatchesMobileList).toHaveBeenCalledWith(
      expect.objectContaining({ matches }),
    );
    expect(recentMatchesMocks.RecentMatchesDesktopTable).toHaveBeenCalledWith(
      expect.objectContaining({ matches }),
    );
    expect(recentMatchesMocks.RecentMatchesEmptyState).not.toHaveBeenCalled();
  });
});
