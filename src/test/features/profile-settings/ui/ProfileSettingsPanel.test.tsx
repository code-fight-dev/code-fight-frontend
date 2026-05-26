import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProfileSettingsPanel } from "@/features/profile-settings/ui/ProfileSettingsPanel";
import { createViewerProfileFixture } from "@/test/features/profile-settings/model/fixtures";

const panelMocks = vi.hoisted(() => ({
  useProfileSettingsPanel: vi.fn(),
}));

vi.mock("@/features/profile-settings/model/useProfileSettingsPanel", () => ({
  useProfileSettingsPanel: panelMocks.useProfileSettingsPanel,
}));

vi.mock("@/features/profile-settings/ui/ProfileSettingsToast", () => ({
  ProfileSettingsToast: ({ message }: { message: string | null }) => (
    <div data-testid="profile-toast">{message ?? "no-toast"}</div>
  ),
}));

vi.mock("@/features/profile-settings/ui/ProfileSettingsTabs", () => ({
  ProfileSettingsTabs: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="profile-tabs">{activeTab}</div>
  ),
}));

vi.mock("@/features/profile-settings/ui/ProfileSettingsAvatarCard", () => ({
  ProfileSettingsAvatarCard: () => <div data-testid="tab-photo">photo</div>,
}));

vi.mock("@/features/profile-settings/ui/ProfileSettingsDisplayNameTab", () => ({
  ProfileSettingsDisplayNameTab: () => (
    <div data-testid="tab-display-name">display-name</div>
  ),
}));

vi.mock("@/features/profile-settings/ui/ProfileSettingsLocationTab", () => ({
  ProfileSettingsLocationTab: () => <div data-testid="tab-location">location</div>,
}));

vi.mock("@/features/profile-settings/ui/ProfileSettingsBioCard", () => ({
  ProfileSettingsBioCard: () => <div data-testid="tab-bio">bio</div>,
}));

function createHookResult(activeTab: "photo" | "display-name" | "location" | "bio") {
  return {
    toastMessage: "Saved",
    tabsProps: {
      activeTab,
      onTabChange: vi.fn(),
      summaries: {
        photo: "photo",
        "display-name": "display-name",
        location: "location",
        bio: "bio",
      },
    },
    photoSectionProps: {},
    displayNameSectionProps: {},
    locationSectionProps: {},
    bioSectionProps: {},
  };
}

describe("features/profile-settings/ui/ProfileSettingsPanel", () => {
  it("calls panel hook with profile and renders display name tab content", () => {
    const profile = createViewerProfileFixture();
    panelMocks.useProfileSettingsPanel.mockReturnValue(createHookResult("display-name"));

    render(<ProfileSettingsPanel profile={profile} />);

    expect(panelMocks.useProfileSettingsPanel).toHaveBeenCalledWith(profile);
    expect(screen.getByTestId("profile-toast")).toHaveTextContent("Saved");
    expect(screen.getByTestId("profile-tabs")).toHaveTextContent("display-name");
    expect(screen.getByTestId("tab-display-name")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-photo")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tab-location")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tab-bio")).not.toBeInTheDocument();
  });

  it("renders photo tab content when photo tab is active", () => {
    panelMocks.useProfileSettingsPanel.mockReturnValue(createHookResult("photo"));
    render(<ProfileSettingsPanel profile={createViewerProfileFixture()} />);

    expect(screen.getByTestId("tab-photo")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-display-name")).not.toBeInTheDocument();
  });

  it("renders location tab content when location tab is active", () => {
    panelMocks.useProfileSettingsPanel.mockReturnValue(createHookResult("location"));
    render(<ProfileSettingsPanel profile={createViewerProfileFixture()} />);

    expect(screen.getByTestId("tab-location")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-photo")).not.toBeInTheDocument();
  });

  it("renders bio tab content when bio tab is active", () => {
    panelMocks.useProfileSettingsPanel.mockReturnValue(createHookResult("bio"));
    render(<ProfileSettingsPanel profile={createViewerProfileFixture()} />);

    expect(screen.getByTestId("tab-bio")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-location")).not.toBeInTheDocument();
  });
});
