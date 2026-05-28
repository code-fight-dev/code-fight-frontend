import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/signup/page", () => {
  it("renders sign up auth page with parsed oauth error code", async () => {
    const signUpConfig = {
      mode: "signup",
    };
    const getOAuthErrorCodeMock = vi.fn().mockReturnValue(null);
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

    const { default: SignUpPage, metadata } = await loadPageModule(
      () => import("@/app/signup/page"),
      () => {
        vi.doMock("@/features/auth", () => ({
          SIGN_IN_AUTH_PAGE: {
            mode: "signin",
          },
          SIGN_UP_AUTH_PAGE: signUpConfig,
        }));
        vi.doMock("@/views/auth/server", () => ({
          getOAuthErrorCode: getOAuthErrorCodeMock,
        }));
        vi.doMock("@/views/auth", () => ({
          AuthPageView: AuthPageViewMock,
        }));
      },
    );
    const element = await SignUpPage({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({}),
    });

    render(element);

    expect(getOAuthErrorCodeMock).toHaveBeenCalledWith(undefined);
    expect(getFirstCallProps(AuthPageViewMock)).toEqual({
      config: signUpConfig,
      oauthErrorCode: null,
    });
    expect(screen.getByTestId("auth-page-view")).toHaveTextContent('"mode":"signup"');
    expect(metadata).toEqual({
      title: "Sign Up | CodeFight",
      description:
        "Create a CodeFight account to solve challenges and compete in coding duels.",
      alternates: {
        canonical: "/signup",
      },
      robots: {
        index: false,
        follow: false,
      },
    });
  });
});
