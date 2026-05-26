import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfileSettingsTabs } from "@/features/profile-settings/ui/ProfileSettingsTabs";

const summaries = {
  photo: "Custom image uploaded",
  "display-name": "Alice",
  location: "San Francisco, California, United States",
  bio: "Practicing algorithms",
} as const;

describe("features/profile-settings/ui/ProfileSettingsTabs", () => {
  it("renders all tabs with summaries", () => {
    render(
      <ProfileSettingsTabs
        activeTab="display-name"
        summaries={summaries}
        onTabChange={vi.fn()}
      />,
    );

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Display Name")).toBeInTheDocument();
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Bio")).toBeInTheDocument();
    expect(screen.getByText("Custom image uploaded")).toBeInTheDocument();
  });

  it("calls onTabChange with tab id on click", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(
      <ProfileSettingsTabs
        activeTab="display-name"
        summaries={summaries}
        onTabChange={onTabChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /photo/i }));
    await user.click(screen.getByRole("button", { name: /location/i }));

    expect(onTabChange).toHaveBeenNthCalledWith(1, "photo");
    expect(onTabChange).toHaveBeenNthCalledWith(2, "location");
  });

  it("applies active styles for selected tab", () => {
    render(
      <ProfileSettingsTabs activeTab="bio" summaries={summaries} onTabChange={vi.fn()} />,
    );

    const activeTabButton = screen.getByRole("button", { name: /bio/i });
    const inactiveTabButton = screen.getByRole("button", { name: /photo/i });

    expect(activeTabButton).toHaveClass("app-settings-option-active");
    expect(inactiveTabButton).not.toHaveClass("app-settings-option-active");
  });
});
