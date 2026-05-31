import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/layout", () => {
  it("builds root layout with providers, header/footer and preferences bootstrap", async () => {
    const SpaceGroteskMock = vi.fn(() => ({ variable: "font-space" }));
    const IbmPlexMonoMock = vi.fn(() => ({ variable: "font-accent" }));
    const FiraCodeMock = vi.fn(() => ({ variable: "font-fira" }));
    const JetbrainsMonoMock = vi.fn(() => ({ variable: "font-jetbrains" }));

    const initialViewer = {
      id: "viewer-1",
      email: "alice@example.com",
      username: "alice",
      createdAt: "2026-05-24T12:00:00.000Z",
    };

    const initialPreferences = {
      theme: "light",
      motion: "disabled",
      editor: {
        fontFamily: "fira-code",
      },
    };

    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(initialViewer);
    const getPreferencesServerMock = vi.fn().mockResolvedValue(initialPreferences);
    const getPreferencesInitScriptMock = vi
      .fn()
      .mockReturnValue("window.__codefight_preferences_bootstrapped__=true;");

    const PreferencesProviderMock = vi.fn(({ children }: { children: ReactNode }) => (
      <div data-testid="preferences-provider">{children}</div>
    ));

    const ViewerSessionProviderMock = vi.fn(({ children }: { children: ReactNode }) => (
      <div data-testid="viewer-provider">{children}</div>
    ));

    const HeaderMock = vi.fn(() => <header>Header</header>);
    const FooterMock = vi.fn(() => <footer>Footer</footer>);

    const layoutModule = await loadPageModule(
      () => import("@/app/layout"),
      () => {
        vi.doMock("next/font/google", () => ({
          Space_Grotesk: SpaceGroteskMock,
          IBM_Plex_Mono: IbmPlexMonoMock,
          Fira_Code: FiraCodeMock,
          JetBrains_Mono: JetbrainsMonoMock,
        }));

        vi.doMock("@/shared/config/seo", () => ({
          SITE_URL: "http://localhost:3000",
        }));

        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));

        vi.doMock("@/features/preferences/server", () => ({
          getPreferencesServer: getPreferencesServerMock,
        }));

        vi.doMock("@/features/preferences", () => ({
          getPreferencesInitScript: getPreferencesInitScriptMock,
          PreferencesProvider: PreferencesProviderMock,
        }));

        vi.doMock("@/entities/viewer", () => ({
          ViewerSessionProvider: ViewerSessionProviderMock,
        }));

        vi.doMock("@/widgets/header", () => ({
          Header: HeaderMock,
        }));

        vi.doMock("@/widgets/footer", () => ({
          Footer: FooterMock,
        }));
      },
    );

    const { default: RootLayout, metadata } = layoutModule;

    expect(metadata).toMatchObject({
      title: "CodeFight",
      description: "CodeFight platform for coding challenges and live competitions.",
      applicationName: "CodeFight",
      openGraph: {
        type: "website",
        siteName: "CodeFight",
        title: "CodeFight",
        description: "CodeFight platform for coding challenges and live competitions.",
        url: "/",
      },
      twitter: {
        card: "summary_large_image",
        title: "CodeFight",
        description: "CodeFight platform for coding challenges and live competitions.",
      },
    });

    expect(metadata.metadataBase?.toString()).toBe("http://localhost:3000/");

    const node = await RootLayout({
      children: <div>Route content</div>,
    });

    const html = renderToStaticMarkup(node);

    expect(getCurrentViewerServerMock).toHaveBeenCalledTimes(1);
    expect(getPreferencesServerMock).toHaveBeenCalledTimes(1);
    expect(getPreferencesInitScriptMock).toHaveBeenCalledTimes(1);

    expect(SpaceGroteskMock).toHaveBeenCalledWith({
      subsets: ["latin", "latin-ext"],
      variable: "--font-sans",
      display: "swap",
    });

    expect(IbmPlexMonoMock).toHaveBeenCalledWith({
      subsets: ["latin", "cyrillic"],
      variable: "--font-accent",
      display: "swap",
      weight: ["400", "500", "600"],
    });

    expect(FiraCodeMock).toHaveBeenCalledWith({
      subsets: ["latin"],
      variable: "--font-editor-fira",
      display: "swap",
    });

    expect(JetbrainsMonoMock).toHaveBeenCalledWith({
      subsets: ["latin"],
      variable: "--font-editor-jetbrains",
      display: "swap",
    });

    expect(PreferencesProviderMock).toHaveBeenCalledTimes(1);
    expect(ViewerSessionProviderMock).toHaveBeenCalledTimes(1);

    const preferencesProviderProps = PreferencesProviderMock.mock.calls[0]?.[0];

    expect(preferencesProviderProps).toMatchObject({
      initialPreferences,
    });

    const viewerProviderProps = ViewerSessionProviderMock.mock.calls[0]?.[0];

    expect(viewerProviderProps).toMatchObject({
      initialViewer,
    });

    expect(HeaderMock).toHaveBeenCalledTimes(1);
    expect(FooterMock).toHaveBeenCalledTimes(1);

    expect(html).toContain('lang="en"');
    expect(html).toContain('data-theme="light"');
    expect(html).toContain('data-motion="disabled"');
    expect(html).toContain('id="codefight-preferences-init"');
    expect(html).toContain("window.__codefight_preferences_bootstrapped__=true;");
    expect(html).toContain("font-space font-accent font-fira font-jetbrains");
    expect(html).toContain("Header");
    expect(html).toContain("Footer");
    expect(html).toContain("Route content");
  });
});
