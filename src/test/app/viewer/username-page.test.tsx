import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/u/[username]/page", () => {
  it("generates profile metadata from username route param", async () => {
    const { generateMetadata } = await loadPageModule(
      () => import("@/app/u/[username]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          notFound: vi.fn(),
        }));
        vi.doMock("@/views/viewer-profile/server", () => ({
          getViewerProfilePageData: vi.fn(),
        }));
        vi.doMock("@/views/viewer-profile", () => ({
          ViewerProfilePageView: vi.fn(() => null),
        }));
      },
    );

    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "alice" }),
    });

    expect(metadata).toEqual({
      title: "@alice | CodeFight",
      description: "Public CodeFight profile for @alice.",
      alternates: {
        canonical: "/u/alice",
      },
    });
  });

  it("calls notFound when profile is missing", async () => {
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const getViewerProfilePageDataMock = vi.fn().mockResolvedValue(null);
    const ViewerProfilePageViewMock = vi.fn(() => <div>profile view</div>);

    const { default: UserProfilePage } = await loadPageModule(
      () => import("@/app/u/[username]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          notFound: notFoundMock,
        }));
        vi.doMock("@/views/viewer-profile/server", () => ({
          getViewerProfilePageData: getViewerProfilePageDataMock,
        }));
        vi.doMock("@/views/viewer-profile", () => ({
          ViewerProfilePageView: ViewerProfilePageViewMock,
        }));
      },
    );

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

    const { default: UserProfilePage } = await loadPageModule(
      () => import("@/app/u/[username]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          notFound: notFoundMock,
        }));
        vi.doMock("@/views/viewer-profile/server", () => ({
          getViewerProfilePageData: getViewerProfilePageDataMock,
        }));
        vi.doMock("@/views/viewer-profile", () => ({
          ViewerProfilePageView: ViewerProfilePageViewMock,
        }));
      },
    );
    const element = await UserProfilePage({
      params: Promise.resolve({ username: "alice" }),
    });

    render(element);

    expect(getFirstCallProps(ViewerProfilePageViewMock)).toEqual({
      profile,
    });
    expect(screen.getByTestId("profile-view")).toHaveTextContent('"username":"alice"');
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
