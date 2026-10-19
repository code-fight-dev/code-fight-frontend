import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ViewerAccountDesktopMenu } from "@/features/viewer-account-menu/ui/ViewerAccountDesktopMenu";
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

describe("features/viewer-account-menu/ui/ViewerAccountDesktopMenu", () => {
  beforeEach(() => {
    restoreMenuItems();
  });

  afterEach(() => {
    restoreMenuItems();
  });

  it("renders collapsed state and applies elevated and navigation classes", () => {
    const { container, rerender } = render(
      <ViewerAccountDesktopMenu
        isElevated
        isNavigationOpen={false}
        viewer={createViewer()}
        isSigningOut={false}
        onSignOut={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", { name: "alice smith/qa" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveClass("h-9");

    const root = trigger.closest("div");
    expect(root).toHaveClass("relative");
    expect(screen.getByRole("menu", { name: "Viewer menu" })).toHaveClass(
      "pointer-events-none",
    );

    rerender(
      <ViewerAccountDesktopMenu
        isElevated={false}
        isNavigationOpen
        viewer={createViewer()}
        isSigningOut={false}
        onSignOut={vi.fn()}
      />,
    );

    expect(trigger).toHaveClass("h-10");
    expect(root).toHaveClass("pointer-events-none");
    expect(root).toHaveClass("opacity-0");
    expect(container.querySelector('[aria-label="Viewer menu"]')).toBeInTheDocument();
  });

  it("opens dropdown, renders account links and signs out", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();

    render(
      <ViewerAccountDesktopMenu
        isElevated={false}
        isNavigationOpen={false}
        viewer={createViewer()}
        isSigningOut={false}
        onSignOut={onSignOut}
      />,
    );

    const trigger = screen.getByRole("button", { name: "alice smith/qa" });
    const menu = screen.getByRole("menu", { name: "Viewer menu" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(menu).toHaveClass("pointer-events-auto");
    expect(screen.getByText("Signed In")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();

    const profileLink = screen.getByRole("menuitem", { name: "My Profile" });
    expect(profileLink).toHaveAttribute("href", "/u/alice%20smith%2Fqa");
    await user.click(profileLink);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    const settingsLink = screen.getByRole("menuitem", { name: "Settings" });
    expect(settingsLink).toHaveAttribute("href", "/settings/profile");
    await user.click(settingsLink);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on outside pointer and Escape, keeps open on inside pointer", async () => {
    const user = userEvent.setup();

    render(
      <ViewerAccountDesktopMenu
        isElevated={false}
        isNavigationOpen={false}
        viewer={createViewer()}
        isSigningOut={false}
        onSignOut={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", { name: "alice smith/qa" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const menu = screen.getByRole("menu", { name: "Viewer menu" });
    fireEvent.pointerDown(menu);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(window, { key: "Enter" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("prevents dropdown visibility and disables sign out while signing out", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();

    render(
      <ViewerAccountDesktopMenu
        isElevated={false}
        isNavigationOpen={false}
        viewer={createViewer()}
        isSigningOut
        onSignOut={onSignOut}
      />,
    );

    const trigger = screen.getByRole("button", { name: "alice smith/qa" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    const signOutButton = screen.getByRole("menuitem", { name: "Signing Out..." });
    expect(signOutButton).toBeDisabled();
    await user.click(signOutButton);
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("keeps dropdown open when fallback non-signout menu button is clicked", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    const settingsItem = VIEWER_ACCOUNT_MENU_ITEMS.find((item) => item.id === "settings");

    if (!settingsItem) {
      throw new Error("Expected settings menu item");
    }

    (settingsItem as { id: string }).id = "help";

    render(
      <ViewerAccountDesktopMenu
        isElevated={false}
        isNavigationOpen={false}
        viewer={createViewer()}
        isSigningOut={false}
        onSignOut={onSignOut}
      />,
    );

    const trigger = screen.getByRole("button", { name: "alice smith/qa" });
    await user.click(trigger);

    const helpButton = within(
      screen.getByRole("menu", { name: "Viewer menu" }),
    ).getByRole("menuitem", { name: "Settings" });
    await user.click(helpButton);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("renders disabled non-signout items with disabled styling", async () => {
    const user = userEvent.setup();
    const settingsItem = VIEWER_ACCOUNT_MENU_ITEMS.find((item) => item.id === "settings");

    if (!settingsItem) {
      throw new Error("Expected settings menu item");
    }

    settingsItem.disabled = true;

    render(
      <ViewerAccountDesktopMenu
        isElevated={false}
        isNavigationOpen={false}
        viewer={createViewer()}
        isSigningOut={false}
        onSignOut={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "alice smith/qa" }));

    const settingsButton = screen.getByRole("menuitem", { name: "Settings" });
    expect(settingsButton).toBeDisabled();
    expect(settingsButton).toHaveClass("cursor-not-allowed");
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
  });
});
