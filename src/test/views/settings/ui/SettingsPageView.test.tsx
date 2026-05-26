import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SETTINGS_SECTIONS } from "@/views/settings/model/sections";
import { SettingsPageView } from "@/views/settings";

const settingsPageViewMocks = vi.hoisted(() => ({
  useSelectedLayoutSegment: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: settingsPageViewMocks.useSelectedLayoutSegment,
}));

function getSidebarLinkByHref(href: string) {
  const links = screen.getAllByRole("link");
  const link = links.find((candidate) => candidate.getAttribute("href") === href);

  if (!link) {
    throw new Error(`Expected sidebar link for href: ${href}`);
  }

  return link;
}

describe("views/settings/ui/SettingsPageView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.dataset.motion = "disabled";
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
  });

  it("renders settings shell with editor section active from selected segment", () => {
    settingsPageViewMocks.useSelectedLayoutSegment.mockReturnValue("editor");

    const { container } = render(
      <SettingsPageView>
        <div>Editor content</div>
      </SettingsPageView>,
    );

    expect(
      screen.getByRole("heading", { name: "Settings", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editor", level: 2 })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tune Monaco editor behavior, typography, cursor animation, padding, and layout for coding sessions.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Editor content")).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Settings sections" });
    expect(within(nav).getAllByRole("link")).toHaveLength(SETTINGS_SECTIONS.length);

    const editorLink = getSidebarLinkByHref("/settings/editor");
    const profileLink = getSidebarLinkByHref("/settings/profile");

    expect(editorLink).toHaveAttribute("aria-current", "page");
    expect(editorLink).toHaveClass("app-settings-nav-item-active");
    expect(profileLink).not.toHaveAttribute("aria-current");

    expect(container.querySelector(".app-settings-page-ambient")).toBeInTheDocument();
    expect(container.querySelector(".app-settings-page-grid")).toBeInTheDocument();
    expect(container.querySelector(".app-settings-shell-ambient")).toBeInTheDocument();
    expect(container.querySelector(".app-settings-shell-grid")).toBeInTheDocument();
  });

  it("falls back to profile section when selected segment is absent", () => {
    settingsPageViewMocks.useSelectedLayoutSegment.mockReturnValue(null);

    render(
      <SettingsPageView>
        <div>Profile content</div>
      </SettingsPageView>,
    );

    expect(
      screen.getByRole("heading", { name: "Profile", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage the public profile fields shown on your player page, including avatar, display name, location, and bio.",
      ),
    ).toBeInTheDocument();
    expect(getSidebarLinkByHref("/settings/profile")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
