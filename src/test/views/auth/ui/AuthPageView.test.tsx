import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { AuthPageConfig } from "@/features/auth";
import { AuthPageView } from "@/views/auth/ui/AuthPageView";

const authPageViewMocks = vi.hoisted(() => ({
  OAuthButton: vi.fn(({ provider, mode }: { provider: string; mode: string }) => (
    <button type="button">{`oauth:${provider}:${mode}`}</button>
  )),
  CredentialsAuthForm: vi.fn(
    ({
      config,
      oauthErrorCode,
    }: {
      config: AuthPageConfig;
      oauthErrorCode: string | null;
    }) => (
      <div data-testid="credentials-form">{`${config.mode}:${oauthErrorCode ?? "none"}`}</div>
    ),
  ),
}));

vi.mock("@/features/auth", async () => {
  const actual = await vi.importActual("@/features/auth");
  return {
    ...actual,
    OAuthButton: authPageViewMocks.OAuthButton,
    CredentialsAuthForm: authPageViewMocks.CredentialsAuthForm,
  };
});

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({
    children,
    className,
    variant,
  }: {
    children: ReactNode;
    className?: string;
    variant?: string;
  }) => (
    <div data-testid="reveal" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/shared/ui/Container", () => ({
  Container: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/shared/ui/AmbientGrid", () => ({
  AmbientGrid: ({ className }: { className?: string }) => (
    <div data-testid="ambient-grid" className={className} />
  ),
}));

vi.mock("@/shared/ui/BrandMark", () => ({
  BrandMark: ({
    className,
    iconClassName,
  }: {
    className?: string;
    iconClassName?: string;
  }) => (
    <div data-testid="brand-mark" data-icon-class={iconClassName} className={className} />
  ),
}));

function createAuthConfig(overrides: Partial<AuthPageConfig> = {}): AuthPageConfig {
  return {
    mode: "signin",
    layout: "card",
    title: "Welcome back",
    description: "Enter credentials",
    dividerLabel: "or use email",
    submitLabel: "Sign In",
    fields: [],
    footerPrompt: "No account?",
    footerLinkLabel: "Sign up",
    footerLinkHref: "/signup",
    ...overrides,
  };
}

describe("views/auth/ui/AuthPageView", () => {
  it("renders auth content and wires oauth + credentials props", () => {
    const config = createAuthConfig({
      mode: "signup",
      title: "Join the Arena",
      description: "Create your account",
      footerPrompt: "Already registered?",
      footerLinkLabel: "Log in",
      footerLinkHref: "/signin",
    });

    render(<AuthPageView config={config} oauthErrorCode="AccessDenied" />);

    expect(screen.getByTestId("ambient-grid")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Join the Arena" })).toBeInTheDocument();
    expect(screen.getByText("Create your account")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "oauth:github:signup" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "oauth:google:signup" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("credentials-form")).toHaveTextContent(
      "signup:AccessDenied",
    );

    const footerLink = screen.getByRole("link", { name: "Log in" });
    expect(footerLink).toHaveAttribute("href", "/signin");
    expect(screen.getByText("Already registered?")).toBeInTheDocument();
  });

  it("applies card layout classes when config.layout is card", () => {
    render(
      <AuthPageView
        config={createAuthConfig({ layout: "card" })}
        oauthErrorCode={null}
      />,
    );

    const reveal = screen.getByTestId("reveal");
    expect(reveal).toHaveAttribute("data-variant", "scale");
    expect(reveal).toHaveClass("app-shell-card");
  });

  it("uses non-card layout when config.layout is stacked", () => {
    render(
      <AuthPageView
        config={createAuthConfig({ layout: "stacked" })}
        oauthErrorCode={null}
      />,
    );

    const reveal = screen.getByTestId("reveal");
    expect(reveal).not.toHaveClass("app-shell-card");
  });
});
