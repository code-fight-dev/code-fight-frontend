import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OAuthButton } from "@/features/auth/ui/OAuthButton";

const oauthButtonMocks = vi.hoisted(() => ({
  getOAuthStartUrl: vi.fn(),
  navigateTo: vi.fn(),
}));

vi.mock("@/features/auth/api/auth", () => ({
  getOAuthStartUrl: oauthButtonMocks.getOAuthStartUrl,
}));
vi.mock("@/features/auth/model/navigation", () => ({
  navigateTo: oauthButtonMocks.navigateTo,
}));

describe("features/auth/ui/OAuthButton", () => {
  beforeEach(() => {
    oauthButtonMocks.getOAuthStartUrl.mockReset();
    oauthButtonMocks.navigateTo.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders github oauth button label", () => {
    oauthButtonMocks.getOAuthStartUrl.mockReturnValue("https://example.test/oauth");

    render(<OAuthButton provider="github" mode="signin" />);

    expect(
      screen.getByRole("button", { name: "Continue with GitHub" }),
    ).toBeInTheDocument();
  });

  it("renders google oauth button label", () => {
    oauthButtonMocks.getOAuthStartUrl.mockReturnValue("https://example.test/oauth");

    render(<OAuthButton provider="google" mode="signup" />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
  });

  it("navigates to oauth url when clicked", async () => {
    const user = userEvent.setup();
    oauthButtonMocks.getOAuthStartUrl.mockReturnValue(
      "https://example.test/oauth/github",
    );

    render(<OAuthButton provider="github" mode="signin" />);
    await user.click(screen.getByRole("button", { name: "Continue with GitHub" }));

    expect(oauthButtonMocks.getOAuthStartUrl).toHaveBeenCalledWith("github", "signin");
    expect(oauthButtonMocks.navigateTo).toHaveBeenCalledWith(
      "https://example.test/oauth/github",
    );
  });

  it("does not navigate when button is disabled", async () => {
    const user = userEvent.setup();
    oauthButtonMocks.getOAuthStartUrl.mockReturnValue(
      "https://example.test/oauth/google",
    );

    render(<OAuthButton provider="google" mode="signup" disabled />);
    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(oauthButtonMocks.getOAuthStartUrl).toHaveBeenCalledWith("google", "signup");
    expect(oauthButtonMocks.navigateTo).not.toHaveBeenCalled();
  });
});
