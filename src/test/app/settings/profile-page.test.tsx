import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

function createViewer(username: string) {
  return {
    id: `viewer-${username}`,
    username,
    email: `${username}@example.com`,
    createdAt: "2026-05-24T12:00:00.000Z",
  };
}

describe("app/settings/profile/page", () => {
  it("redirects guests to sign in", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(null);
    const getViewerProfileMock = vi.fn();
    const ProfileSettingsPanelMock = vi.fn(() => <div>Profile settings</div>);

    const { default: ProfileSettingsPage } = await loadPageModule(
      () => import("@/app/settings/profile/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
          notFound: notFoundMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/entities/viewer", () => ({
          getViewerProfile: getViewerProfileMock,
        }));
        vi.doMock("@/features/profile-settings", () => ({
          ProfileSettingsPanel: ProfileSettingsPanelMock,
        }));
      },
    );

    await expect(ProfileSettingsPage()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/signin");
    expect(getViewerProfileMock).not.toHaveBeenCalled();
    expect(notFoundMock).not.toHaveBeenCalled();
    expect(ProfileSettingsPanelMock).not.toHaveBeenCalled();
  });

  it("calls notFound when viewer profile is missing", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const viewer = createViewer("alice");
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(viewer);
    const getViewerProfileMock = vi.fn().mockResolvedValue(null);
    const ProfileSettingsPanelMock = vi.fn(() => <div>Profile settings</div>);

    const { default: ProfileSettingsPage } = await loadPageModule(
      () => import("@/app/settings/profile/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
          notFound: notFoundMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/entities/viewer", () => ({
          getViewerProfile: getViewerProfileMock,
        }));
        vi.doMock("@/features/profile-settings", () => ({
          ProfileSettingsPanel: ProfileSettingsPanelMock,
        }));
      },
    );

    await expect(ProfileSettingsPage()).rejects.toThrow("NEXT_NOT_FOUND");

    expect(getCurrentViewerServerMock).toHaveBeenCalledTimes(1);
    expect(getViewerProfileMock).toHaveBeenCalledWith("alice");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(ProfileSettingsPanelMock).not.toHaveBeenCalled();
  });

  it("renders ProfileSettingsPanel with viewer profile", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const viewer = createViewer("alice");
    const profile = {
      id: "viewer-alice",
      username: "alice",
      displayName: "Alice",
    };
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(viewer);
    const getViewerProfileMock = vi.fn().mockResolvedValue(profile);
    const ProfileSettingsPanelMock = vi.fn(({ profile: value }: { profile: unknown }) => (
      <div data-testid="profile-settings-panel">{JSON.stringify(value)}</div>
    ));

    const { default: ProfileSettingsPage } = await loadPageModule(
      () => import("@/app/settings/profile/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
          notFound: notFoundMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/entities/viewer", () => ({
          getViewerProfile: getViewerProfileMock,
        }));
        vi.doMock("@/features/profile-settings", () => ({
          ProfileSettingsPanel: ProfileSettingsPanelMock,
        }));
      },
    );
    const element = await ProfileSettingsPage();

    render(element);

    expect(getCurrentViewerServerMock).toHaveBeenCalledTimes(1);
    expect(getViewerProfileMock).toHaveBeenCalledWith("alice");
    expect(getFirstCallProps(ProfileSettingsPanelMock)).toEqual({
      profile,
    });
    expect(screen.getByTestId("profile-settings-panel")).toHaveTextContent(
      '"username":"alice"',
    );
    expect(redirectMock).not.toHaveBeenCalled();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
