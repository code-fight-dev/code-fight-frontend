import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";
import { createViewerWithUsername } from "@/test/fixtures/viewer";

describe("app/settings/layout", () => {
  it("redirects guests to sign in", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(null);
    const SettingsPageViewMock = vi.fn(({ children }: { children: ReactNode }) => (
      <section data-testid="settings-view">{children}</section>
    ));

    const { default: SettingsLayout } = await loadPageModule(
      () => import("@/app/settings/layout"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/views/settings", () => ({
          SettingsPageView: SettingsPageViewMock,
        }));
      },
    );

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
    const getCurrentViewerServerMock = vi
      .fn()
      .mockResolvedValue(createViewerWithUsername("alice"));
    const SettingsPageViewMock = vi.fn(({ children }: { children: ReactNode }) => (
      <section data-testid="settings-view">{children}</section>
    ));

    const { default: SettingsLayout } = await loadPageModule(
      () => import("@/app/settings/layout"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/views/settings", () => ({
          SettingsPageView: SettingsPageViewMock,
        }));
      },
    );

    const element = await SettingsLayout({
      children: <div>Settings content</div>,
    });

    render(<>{element}</>);

    expect(screen.getByTestId("settings-view")).toBeInTheDocument();
    expect(screen.getByText("Settings content")).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
