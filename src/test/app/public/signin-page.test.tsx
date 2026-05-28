import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/signin/page", () => {
  it("renders sign in auth page with parsed oauth error code", async () => {
    const signInConfig = {
      mode: "signin",
    };
    const getOAuthErrorCodeMock = vi.fn().mockReturnValue("access_denied");
    const AuthPageViewMock = vi.fn(
      ({ config, oauthErrorCode }: { config: unknown; oauthErrorCode: unknown }) => (
        <div data-testid="auth-page-view">
          {JSON.stringify({
            config,
            oauthErrorCode,
          })}
        </div>
      ),
    );

    const { default: SignInPage, metadata } = await loadPageModule(
      () => import("@/app/signin/page"),
      () => {
        vi.doMock("@/features/auth", () => ({
          SIGN_IN_AUTH_PAGE: signInConfig,
          SIGN_UP_AUTH_PAGE: {
            mode: "signup",
          },
        }));
        vi.doMock("@/views/auth/server", () => ({
          getOAuthErrorCode: getOAuthErrorCodeMock,
        }));
        vi.doMock("@/views/auth", () => ({
          AuthPageView: AuthPageViewMock,
        }));
      },
    );
    const element = await SignInPage({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({
        error: "access_denied",
      }),
    });

    render(element);

    expect(getOAuthErrorCodeMock).toHaveBeenCalledWith("access_denied");
    expect(getFirstCallProps(AuthPageViewMock)).toEqual({
      config: signInConfig,
      oauthErrorCode: "access_denied",
    });
    expect(screen.getByTestId("auth-page-view")).toHaveTextContent('"mode":"signin"');
    expect(metadata).toEqual({
      title: "Sign In | CodeFight",
      description: "Sign in to CodeFight and continue your coding journey.",
      alternates: {
        canonical: "/signin",
      },
      robots: {
        index: false,
        follow: false,
      },
    });
  });
});
