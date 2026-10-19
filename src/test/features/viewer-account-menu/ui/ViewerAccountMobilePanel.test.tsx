import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ViewerAccountMobilePanel } from "@/features/viewer-account-menu/ui/ViewerAccountMobilePanel";
import { VIEWER_ACCOUNT_MENU_ITEMS } from "@/features/viewer-account-menu/model/items";
import type { Viewer } from "@/entities/viewer";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...restProps
  }: {
    children: ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    const onClick =
      typeof restProps.onClick === "function" ? restProps.onClick : undefined;

    return (
      <a
        href={href}
        {...restProps}
        onClick={(event) => {
          event.preventDefault();
          onClick?.(event);
        }}
      >
        {children}
      </a>
    );
  },
}));

const BASE_MENU_ITEMS = VIEWER_ACCOUNT_MENU_ITEMS.map((item) => ({ ...item }));

function restoreMenuItems() {
  VIEWER_ACCOUNT_MENU_ITEMS.splice(
    0,
    VIEWER_ACCOUNT_MENU_ITEMS.length,
    ...BASE_MENU_ITEMS.map((item) => ({ ...item })),
  );
}

function createViewer(overrides: Partial<Viewer> = {}): Viewer {
  return {
    id: "viewer-1",
    role: "user",
    roleVersion: 1,
    email: "alice@example.com",
    username: "alice smith/qa",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("features/viewer-account-menu/ui/ViewerAccountMobilePanel", () => {
  beforeEach(() => {
    restoreMenuItems();
  });

  afterEach(() => {
    restoreMenuItems();
  });

  it("renders profile card and closed state styles", () => {
    const { container, rerender } = render(
      <ViewerAccountMobilePanel
        isOpen={false}
        viewer={createViewer()}
        isSigningOut={false}
        onClose={vi.fn()}
        onSignOut={vi.fn()}
      />,
    );

    const root = container.firstElementChild as HTMLElement | null;
    if (!root) {
      throw new Error("Expected mobile panel root to exist");
    }

    expect(root).toHaveClass("translate-y-4");
    expect(root).toHaveClass("opacity-0");
    expect(root.style.transitionDelay).toBe("0ms");
    expect(screen.getByText("Signed In")).toBeInTheDocument();
    expect(screen.getByText("alice smith/qa")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();

    rerender(
      <ViewerAccountMobilePanel
        isOpen
        viewer={createViewer()}
        isSigningOut={false}
        onClose={vi.fn()}
        onSignOut={vi.fn()}
      />,
    );

    expect(root).toHaveClass("transform-none");
    expect(root).toHaveClass("opacity-100");
    expect(root.style.transitionDelay).toBe("220ms");
  });

  it("renders profile and settings links and closes panel on navigation", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ViewerAccountMobilePanel
        isOpen
        viewer={createViewer()}
        isSigningOut={false}
        onClose={onClose}
        onSignOut={vi.fn()}
      />,
    );

    const profileLink = screen.getByRole("link", { name: "My Profile" });
    const settingsLink = screen.getByRole("link", { name: "Settings" });

    expect(profileLink).toHaveAttribute("href", "/u/alice%20smith%2Fqa");
    expect(settingsLink).toHaveAttribute("href", "/settings/profile");

    await user.click(profileLink);
    await user.click(settingsLink);

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("calls close and sign out on sign-out action", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSignOut = vi.fn();

    render(
      <ViewerAccountMobilePanel
        isOpen
        viewer={createViewer()}
        isSigningOut={false}
        onClose={onClose}
        onSignOut={onSignOut}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("disables sign-out action and updates label while signing out", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSignOut = vi.fn();

    render(
      <ViewerAccountMobilePanel
        isOpen
        viewer={createViewer()}
        isSigningOut
        onClose={onClose}
        onSignOut={onSignOut}
      />,
    );

    const signOutButton = screen.getByRole("button", { name: "Signing Out..." });
    expect(signOutButton).toBeDisabled();

    await user.click(signOutButton);
    expect(onClose).not.toHaveBeenCalled();
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("renders disabled menu item as non-link button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const settingsItem = VIEWER_ACCOUNT_MENU_ITEMS.find((item) => item.id === "settings");

    if (!settingsItem) {
      throw new Error("Expected settings menu item");
    }

    settingsItem.disabled = true;

    render(
      <ViewerAccountMobilePanel
        isOpen
        viewer={createViewer()}
        isSigningOut={false}
        onClose={onClose}
        onSignOut={vi.fn()}
      />,
    );

    const settingsButton = screen.getByRole("button", { name: "Settings" });
    expect(settingsButton).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();

    await user.click(settingsButton);
    expect(onClose).not.toHaveBeenCalled();
  });
});
