import { fireEvent, render, screen } from "@testing-library/react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "@/widgets/header";

const headerUiMocks = vi.hoisted(() => ({
  useHeaderState: vi.fn(),
  useViewerSession: vi.fn(),
  ViewerAccountDesktopMenu: vi.fn(
    ({ isSigningOut, onSignOut }: { isSigningOut: boolean; onSignOut: () => void }) => (
      <button
        type="button"
        data-testid="viewer-account-desktop-menu"
        data-signing-out={String(isSigningOut)}
        onClick={onSignOut}
      >
        Desktop Viewer Menu
      </button>
    ),
  ),
  ViewerAccountMobilePanel: vi.fn(
    ({
      isOpen,
      isSigningOut,
      onClose,
      onSignOut,
    }: {
      isOpen: boolean;
      isSigningOut: boolean;
      onClose: () => void;
      onSignOut: () => void;
    }) => (
      <div data-testid="viewer-account-mobile-panel" data-open={String(isOpen)}>
        <div data-testid="viewer-account-mobile-panel-state">{String(isSigningOut)}</div>
        <button type="button" onClick={onClose}>
          Close Viewer Panel
        </button>
        <button type="button" onClick={onSignOut}>
          Sign Out Viewer
        </button>
      </div>
    ),
  ),
}));

vi.mock("@/widgets/header/model/useHeaderState", () => ({
  useHeaderState: headerUiMocks.useHeaderState,
}));

vi.mock("@/entities/viewer", () => ({
  useViewerSession: headerUiMocks.useViewerSession,
}));

vi.mock("@/features/viewer-account-menu", () => ({
  ViewerAccountDesktopMenu: headerUiMocks.ViewerAccountDesktopMenu,
  ViewerAccountMobilePanel: headerUiMocks.ViewerAccountMobilePanel,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    onClick,
    children,
    ...rest
  }: {
    href: string;
    onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

function createHeaderState(overrides: Record<string, unknown> = {}) {
  return {
    isReady: true,
    isElevated: false,
    isMenuOpen: false,
    surfaceStyles: {
      leftGlowStyle: { transform: "translate(1px, 2px)" },
      rightGlowStyle: { transform: "translate(3px, 4px)" },
      shimmerStyle: { transform: "translateX(12px)" },
      trailStyle: { transform: "translateX(18px)" },
    },
    closeMenu: vi.fn(),
    toggleMenu: vi.fn(),
    ...overrides,
  };
}

function createSessionState(overrides: Record<string, unknown> = {}) {
  return {
    viewer: null,
    isLoading: false,
    isSigningOut: false,
    signOut: vi.fn(),
    ...overrides,
  };
}

function getLastLinkByName(name: string) {
  const lastLink = screen.getAllByRole("link", { name }).at(-1);

  if (!lastLink) {
    throw new Error(`Expected at least one link with name: ${name}`);
  }

  return lastLink;
}

describe("widgets/header/ui/Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders guest navigation, guest actions and mobile guest panel", () => {
    const state = createHeaderState();
    const session = createSessionState();

    headerUiMocks.useHeaderState.mockReturnValue(state);
    headerUiMocks.useViewerSession.mockReturnValue(session);

    render(<Header />);

    expect(screen.getByRole("button", { name: "Open navigation menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByTestId("viewer-account-desktop-menu")).not.toBeInTheDocument();
    expect(screen.queryByTestId("viewer-account-mobile-panel")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Sign In" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Join Now" })).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(state.toggleMenu).toHaveBeenCalledTimes(1);

    const mobileArenaLink = getLastLinkByName("Arena");
    const mobileSignInLink = getLastLinkByName("Sign In");
    const mobileJoinNowLink = getLastLinkByName("Join Now");

    fireEvent.click(mobileArenaLink);
    fireEvent.click(mobileSignInLink);
    fireEvent.click(mobileJoinNowLink);
    expect(state.closeMenu).toHaveBeenCalledTimes(3);
  });

  it("renders loading skeleton and open mobile overlay when menu is open", () => {
    const state = createHeaderState({
      isReady: false,
      isElevated: true,
      isMenuOpen: true,
    });
    const session = createSessionState({ isLoading: true });

    headerUiMocks.useHeaderState.mockReturnValue(state);
    headerUiMocks.useViewerSession.mockReturnValue(session);

    render(<Header />);

    expect(screen.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.queryByTestId("viewer-account-desktop-menu")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Sign In" })).toHaveLength(1);

    const overlayNavLink = getLastLinkByName("Arena");
    expect(overlayNavLink).toHaveStyle({ transitionDelay: "80ms" });

    const mobileGuestSignIn = getLastLinkByName("Sign In");
    const mobileGuestPanel = mobileGuestSignIn.closest("div.grid");
    expect(mobileGuestPanel).toHaveClass("transform-none", "opacity-100");
    expect(mobileGuestPanel).toHaveStyle({ transitionDelay: "220ms" });
  });

  it("applies guest desktop action state when menu is open", () => {
    const state = createHeaderState({
      isElevated: true,
      isMenuOpen: true,
    });
    const session = createSessionState({ viewer: null, isLoading: false });

    headerUiMocks.useHeaderState.mockReturnValue(state);
    headerUiMocks.useViewerSession.mockReturnValue(session);

    render(<Header />);

    const joinNowLinks = screen.getAllByRole("link", { name: "Join Now" });
    const desktopJoinNow = joinNowLinks.find((element) =>
      element.className.includes("lg:px-5"),
    );

    expect(desktopJoinNow).toBeDefined();
    expect(desktopJoinNow).toHaveClass(
      "sm:pointer-events-none",
      "sm:scale-95",
      "sm:opacity-0",
    );
  });

  it("renders viewer account menus and forwards sign-out/close callbacks", () => {
    const state = createHeaderState({
      isElevated: true,
      isMenuOpen: true,
    });
    const viewer = {
      id: "viewer-1",
      email: "viewer@example.com",
      username: "viewer",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const session = createSessionState({
      viewer,
      isSigningOut: true,
    });

    headerUiMocks.useHeaderState.mockReturnValue(state);
    headerUiMocks.useViewerSession.mockReturnValue(session);

    render(<Header />);

    expect(screen.getByTestId("viewer-account-desktop-menu")).toHaveAttribute(
      "data-signing-out",
      "true",
    );
    expect(screen.getByTestId("viewer-account-mobile-panel")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.queryAllByRole("link", { name: "Sign In" })).toHaveLength(0);
    expect(screen.queryAllByRole("link", { name: "Join Now" })).toHaveLength(0);

    expect(headerUiMocks.ViewerAccountDesktopMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        isElevated: true,
        isNavigationOpen: true,
        viewer,
        isSigningOut: true,
        onSignOut: session.signOut,
      }),
      undefined,
    );
    expect(headerUiMocks.ViewerAccountMobilePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        viewer,
        isSigningOut: true,
        onClose: state.closeMenu,
        onSignOut: session.signOut,
      }),
      undefined,
    );

    fireEvent.click(screen.getByRole("button", { name: "Desktop Viewer Menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Close Viewer Panel" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign Out Viewer" }));

    expect(session.signOut).toHaveBeenCalledTimes(2);
    expect(state.closeMenu).toHaveBeenCalledTimes(1);
  });
});
