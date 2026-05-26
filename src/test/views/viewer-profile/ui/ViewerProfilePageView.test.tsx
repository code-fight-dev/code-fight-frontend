import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createViewerProfileFixture } from "@/test/features/profile-settings/model/fixtures";
import { ViewerProfilePageView } from "@/views/viewer-profile/ui/ViewerProfilePageView";

const viewerProfilePageMocks = vi.hoisted(() => ({
  useViewerSession: vi.fn(),
  ProfileSummary: vi.fn(),
  StatsCards: vi.fn(),
  EloHistoryChart: vi.fn(),
  RecentMatches: vi.fn(),
  RankProgression: vi.fn(),
  TopLanguages: vi.fn(),
}));

vi.mock("@/entities/viewer", async () => {
  const actual = (await vi.importActual("@/entities/viewer")) as Record<string, unknown>;

  return {
    ...actual,
    useViewerSession: viewerProfilePageMocks.useViewerSession,
  };
});

vi.mock("@/shared/ui/Container", () => ({
  Container: ({ children }: { children: ReactNode }) => (
    <div data-testid="profile-page-container">{children}</div>
  ),
}));

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/views/viewer-profile/ui/ProfileSummary", () => ({
  ProfileSummary: (props: Record<string, unknown>) => {
    viewerProfilePageMocks.ProfileSummary(props);
    return <div data-testid="profile-summary">summary</div>;
  },
}));

vi.mock("@/views/viewer-profile/ui/StatsCards", () => ({
  StatsCards: (props: Record<string, unknown>) => {
    viewerProfilePageMocks.StatsCards(props);
    return <div data-testid="stats-cards">stats</div>;
  },
}));

vi.mock("@/views/viewer-profile/ui/EloHistoryChart", () => ({
  EloHistoryChart: (props: Record<string, unknown>) => {
    viewerProfilePageMocks.EloHistoryChart(props);
    return <div data-testid="elo-history-chart">chart</div>;
  },
}));

vi.mock("@/views/viewer-profile/ui/RecentMatches", () => ({
  RecentMatches: (props: Record<string, unknown>) => {
    viewerProfilePageMocks.RecentMatches(props);
    return <div data-testid="recent-matches">recent</div>;
  },
}));

vi.mock("@/views/viewer-profile/ui/RankProgression", () => ({
  RankProgression: (props: Record<string, unknown>) => {
    viewerProfilePageMocks.RankProgression(props);
    return <div data-testid="rank-progression">rank</div>;
  },
}));

vi.mock("@/views/viewer-profile/ui/TopLanguages", () => ({
  TopLanguages: (props: Record<string, unknown>) => {
    viewerProfilePageMocks.TopLanguages(props);
    return <div data-testid="top-languages">languages</div>;
  },
}));

describe("views/viewer-profile/ui/ViewerProfilePageView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds profile page composition and marks owner by viewer id", () => {
    const profile = createViewerProfileFixture({
      id: "viewer-1",
      username: "alice",
      createdAt: "2026-05-24T12:00:00.000Z",
      stats: {
        eloRating: 1500,
      },
    });

    viewerProfilePageMocks.useViewerSession.mockReturnValue({
      viewer: {
        id: "viewer-1",
        username: "someone-else",
      },
    });

    render(<ViewerProfilePageView profile={profile} />);

    expect(screen.getByTestId("profile-page-container")).toBeInTheDocument();
    expect(screen.getByTestId("profile-summary")).toBeInTheDocument();
    expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
    expect(screen.getByTestId("elo-history-chart")).toBeInTheDocument();
    expect(screen.getByTestId("recent-matches")).toBeInTheDocument();
    expect(screen.getByTestId("rank-progression")).toBeInTheDocument();
    expect(screen.getByTestId("top-languages")).toBeInTheDocument();

    expect(viewerProfilePageMocks.ProfileSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        profile,
        rankTier: "C",
        rankColor: "#3C4FD1",
        joinedLabel: "May 2026",
        isOwner: true,
      }),
    );
    expect(viewerProfilePageMocks.StatsCards).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: profile.stats,
      }),
    );
    expect(viewerProfilePageMocks.EloHistoryChart).toHaveBeenCalledWith(
      expect.objectContaining({
        points: profile.eloHistory,
        accentColor: "#3C4FD1",
      }),
    );
    expect(viewerProfilePageMocks.RecentMatches).toHaveBeenCalledWith(
      expect.objectContaining({
        matches: profile.recentMatches,
      }),
    );
    expect(viewerProfilePageMocks.RankProgression).toHaveBeenCalledWith(
      expect.objectContaining({
        rating: profile.stats.eloRating,
        country: profile.country,
        countryCode: profile.countryCode,
        globalRank: profile.stats.globalRank,
        globalPlayersCount: profile.stats.globalPlayersCount,
        regionalRank: profile.stats.regionalRank,
        regionalPlayersCount: profile.stats.regionalPlayersCount,
      }),
    );
    expect(viewerProfilePageMocks.TopLanguages).toHaveBeenCalledWith(
      expect.objectContaining({
        languages: profile.topLanguages,
      }),
    );
  });

  it("marks owner when usernames match case-insensitively and false otherwise", () => {
    const profile = createViewerProfileFixture({
      id: "profile-owner",
      username: "CodeMaster",
      stats: {
        eloRating: 1750,
      },
    });

    viewerProfilePageMocks.useViewerSession.mockReturnValue({
      viewer: {
        id: "other-viewer",
        username: "codemaster",
      },
    });

    render(<ViewerProfilePageView profile={profile} />);

    expect(viewerProfilePageMocks.ProfileSummary).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isOwner: true,
        rankTier: "B",
        rankColor: "#9D1F82",
      }),
    );

    viewerProfilePageMocks.useViewerSession.mockReturnValue({
      viewer: {
        id: "other-viewer",
        username: "not-owner",
      },
    });

    render(<ViewerProfilePageView profile={profile} />);

    expect(viewerProfilePageMocks.ProfileSummary).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isOwner: false,
      }),
    );
  });
});
