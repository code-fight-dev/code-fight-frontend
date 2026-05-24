import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SETTINGS_PROFILE_HREF } from "@/shared/config/routes";

function createViewer(username: string) {
  return {
    id: `viewer-${username}`,
    username,
    email: `${username}@example.com`,
    createdAt: "2026-05-24T12:00:00.000Z",
  };
}

describe("app/page", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("loads home data and passes it to HomePage view", async () => {
    const homeData = {
      featuredChallenges: [],
      activity: [],
      metrics: {
        activeUsers: 100,
      },
    };

    const getHomePageDataMock = vi.fn().mockResolvedValue(homeData);
    const HomePageMock = vi.fn(({ data }: { data: unknown }) => (
      <div data-testid="home-page">{JSON.stringify(data)}</div>
    ));

    vi.doMock("@/views/home/server", () => ({
      getHomePageData: getHomePageDataMock,
    }));
    vi.doMock("@/views/home", () => ({
      HomePage: HomePageMock,
    }));

    const { default: HomePage } = await import("@/app/page");
    const element = await HomePage();

    render(element);

    expect(getHomePageDataMock).toHaveBeenCalledTimes(1);
    expect(HomePageMock).toHaveBeenCalledWith(
      {
        data: homeData,
      },
      undefined,
    );
    expect(screen.getByTestId("home-page")).toHaveTextContent('"activeUsers":100');
  });
});

describe("app/settings/page", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("redirects to profile settings entrypoint", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });

    vi.doMock("next/navigation", () => ({
      redirect: redirectMock,
    }));

    const { default: SettingsPage } = await import("@/app/settings/page");

    expect(() => SettingsPage()).toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith(SETTINGS_PROFILE_HREF);
  });
});

describe("app/challenges/layout", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("redirects guests to sign in", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(null);

    vi.doMock("next/navigation", () => ({
      redirect: redirectMock,
    }));
    vi.doMock("@/entities/viewer/server", () => ({
      getCurrentViewerServer: getCurrentViewerServerMock,
    }));

    const { default: ChallengesLayout } = await import("@/app/challenges/layout");

    await expect(
      ChallengesLayout({
        children: <div>Challenges content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });

  it("returns children for authenticated viewer", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(createViewer("alice"));

    vi.doMock("next/navigation", () => ({
      redirect: redirectMock,
    }));
    vi.doMock("@/entities/viewer/server", () => ({
      getCurrentViewerServer: getCurrentViewerServerMock,
    }));

    const { default: ChallengesLayout } = await import("@/app/challenges/layout");

    const element = await ChallengesLayout({
      children: <div>Challenges content</div>,
    });

    render(<>{element}</>);

    expect(screen.getByText("Challenges content")).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("app/settings/layout", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("redirects guests to sign in", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(null);
    const SettingsPageViewMock = vi.fn(({ children }: { children: ReactNode }) => (
      <section data-testid="settings-view">{children}</section>
    ));

    vi.doMock("next/navigation", () => ({
      redirect: redirectMock,
    }));
    vi.doMock("@/entities/viewer/server", () => ({
      getCurrentViewerServer: getCurrentViewerServerMock,
    }));
    vi.doMock("@/views/settings", () => ({
      SettingsPageView: SettingsPageViewMock,
    }));

    const { default: SettingsLayout } = await import("@/app/settings/layout");

    await expect(
      SettingsLayout({
        children: <div>Settings content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/signin");
    expect(SettingsPageViewMock).not.toHaveBeenCalled();
  });

  it("wraps settings children for authenticated viewer", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(createViewer("alice"));
    const SettingsPageViewMock = vi.fn(({ children }: { children: ReactNode }) => (
      <section data-testid="settings-view">{children}</section>
    ));

    vi.doMock("next/navigation", () => ({
      redirect: redirectMock,
    }));
    vi.doMock("@/entities/viewer/server", () => ({
      getCurrentViewerServer: getCurrentViewerServerMock,
    }));
    vi.doMock("@/views/settings", () => ({
      SettingsPageView: SettingsPageViewMock,
    }));

    const { default: SettingsLayout } = await import("@/app/settings/layout");

    const element = await SettingsLayout({
      children: <div>Settings content</div>,
    });

    render(<>{element}</>);

    expect(screen.getByTestId("settings-view")).toBeInTheDocument();
    expect(screen.getByText("Settings content")).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("app/challenges/[slug]/page", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns fallback metadata when challenge does not exist", async () => {
    const getChallengeBySlugMock = vi.fn().mockResolvedValue(null);

    vi.doMock("@/views/challenges/server", () => ({
      getChallengeBySlug: getChallengeBySlugMock,
    }));
    vi.doMock("@/views/challenges", () => ({
      ChallengeWorkspace: () => <div>workspace</div>,
    }));
    vi.doMock("next/navigation", () => ({
      notFound: vi.fn(() => {
        throw new Error("NEXT_NOT_FOUND");
      }),
    }));

    const { generateMetadata } = await import("@/app/challenges/[slug]/page");

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "missing-slug" }),
    });

    expect(getChallengeBySlugMock).toHaveBeenCalledWith("missing-slug");
    expect(metadata).toEqual({
      title: "Challenge not found | CodeFight",
    });
  });

  it("returns challenge metadata when challenge exists", async () => {
    const challenge = {
      title: "Two Sum",
      summary: "Find two numbers that sum to target.",
    };
    const getChallengeBySlugMock = vi.fn().mockResolvedValue(challenge);

    vi.doMock("@/views/challenges/server", () => ({
      getChallengeBySlug: getChallengeBySlugMock,
    }));
    vi.doMock("@/views/challenges", () => ({
      ChallengeWorkspace: () => <div>workspace</div>,
    }));
    vi.doMock("next/navigation", () => ({
      notFound: vi.fn(() => {
        throw new Error("NEXT_NOT_FOUND");
      }),
    }));

    const { generateMetadata } = await import("@/app/challenges/[slug]/page");

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "two-sum" }),
    });

    expect(metadata).toEqual({
      title: "Two Sum | CodeFight Challenges",
      description: "Find two numbers that sum to target.",
    });
  });

  it("calls notFound when challenge is missing", async () => {
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const getChallengeBySlugMock = vi.fn().mockResolvedValue(null);
    const ChallengeWorkspaceMock = vi.fn(({ challenge }: { challenge: unknown }) => (
      <div>{JSON.stringify(challenge)}</div>
    ));

    vi.doMock("@/views/challenges/server", () => ({
      getChallengeBySlug: getChallengeBySlugMock,
    }));
    vi.doMock("@/views/challenges", () => ({
      ChallengeWorkspace: ChallengeWorkspaceMock,
    }));
    vi.doMock("next/navigation", () => ({
      notFound: notFoundMock,
    }));

    const { default: ChallengeDetailPage } = await import("@/app/challenges/[slug]/page");

    await expect(
      ChallengeDetailPage({
        params: Promise.resolve({ slug: "missing-slug" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalledTimes(1);
    expect(ChallengeWorkspaceMock).not.toHaveBeenCalled();
  });

  it("renders workspace with challenge data", async () => {
    const challenge = {
      slug: "two-sum",
      title: "Two Sum",
      summary: "Find two numbers that sum to target.",
    };
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const getChallengeBySlugMock = vi.fn().mockResolvedValue(challenge);
    const ChallengeWorkspaceMock = vi.fn(
      ({ challenge: value }: { challenge: unknown }) => (
        <div data-testid="challenge-workspace">{JSON.stringify(value)}</div>
      ),
    );

    vi.doMock("@/views/challenges/server", () => ({
      getChallengeBySlug: getChallengeBySlugMock,
    }));
    vi.doMock("@/views/challenges", () => ({
      ChallengeWorkspace: ChallengeWorkspaceMock,
    }));
    vi.doMock("next/navigation", () => ({
      notFound: notFoundMock,
    }));

    const { default: ChallengeDetailPage } = await import("@/app/challenges/[slug]/page");
    const element = await ChallengeDetailPage({
      params: Promise.resolve({ slug: "two-sum" }),
    });

    render(element);

    expect(ChallengeWorkspaceMock).toHaveBeenCalledWith(
      {
        challenge,
      },
      undefined,
    );
    expect(screen.getByTestId("challenge-workspace")).toHaveTextContent(
      '"slug":"two-sum"',
    );
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});

describe("app/u/[username]/page", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("calls notFound when profile is missing", async () => {
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const getViewerProfilePageDataMock = vi.fn().mockResolvedValue(null);
    const ViewerProfilePageViewMock = vi.fn(() => <div>profile view</div>);

    vi.doMock("next/navigation", () => ({
      notFound: notFoundMock,
    }));
    vi.doMock("@/views/viewer-profile/server", () => ({
      getViewerProfilePageData: getViewerProfilePageDataMock,
    }));
    vi.doMock("@/views/viewer-profile", () => ({
      ViewerProfilePageView: ViewerProfilePageViewMock,
    }));

    const { default: UserProfilePage } = await import("@/app/u/[username]/page");

    await expect(
      UserProfilePage({
        params: Promise.resolve({ username: "ghost" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(getViewerProfilePageDataMock).toHaveBeenCalledWith("ghost");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
    expect(ViewerProfilePageViewMock).not.toHaveBeenCalled();
  });

  it("renders profile view when profile exists", async () => {
    const profile = {
      username: "alice",
      stats: {},
    };
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const getViewerProfilePageDataMock = vi.fn().mockResolvedValue(profile);
    const ViewerProfilePageViewMock = vi.fn(
      ({ profile: value }: { profile: unknown }) => (
        <div data-testid="profile-view">{JSON.stringify(value)}</div>
      ),
    );

    vi.doMock("next/navigation", () => ({
      notFound: notFoundMock,
    }));
    vi.doMock("@/views/viewer-profile/server", () => ({
      getViewerProfilePageData: getViewerProfilePageDataMock,
    }));
    vi.doMock("@/views/viewer-profile", () => ({
      ViewerProfilePageView: ViewerProfilePageViewMock,
    }));

    const { default: UserProfilePage } = await import("@/app/u/[username]/page");
    const element = await UserProfilePage({
      params: Promise.resolve({ username: "alice" }),
    });

    render(element);

    expect(ViewerProfilePageViewMock).toHaveBeenCalledWith(
      {
        profile,
      },
      undefined,
    );
    expect(screen.getByTestId("profile-view")).toHaveTextContent('"username":"alice"');
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
