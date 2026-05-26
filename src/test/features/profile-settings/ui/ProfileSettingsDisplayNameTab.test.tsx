import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PROFILE_DISPLAY_NAME_LIMIT } from "@/features/profile-settings/model/constants";
import { ProfileSettingsDisplayNameTab } from "@/features/profile-settings/ui/ProfileSettingsDisplayNameTab";

describe("features/profile-settings/ui/ProfileSettingsDisplayNameTab", () => {
  it("renders field metadata and value counter", () => {
    render(
      <ProfileSettingsDisplayNameTab
        displayName="Alice"
        isSaving={false}
        isSavePending={false}
        hasChanges={false}
        errorMessage={null}
        onDisplayNameChange={vi.fn()}
        onReset={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText("Public name")).toBeInTheDocument();
    expect(screen.getByText(`5/${PROFILE_DISPLAY_NAME_LIMIT}`)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Alice")).toHaveAttribute(
      "placeholder",
      "How your name appears on the profile page",
    );
  });

  it("calls change, reset and save callbacks", async () => {
    const user = userEvent.setup();
    const onDisplayNameChange = vi.fn();
    const onReset = vi.fn();
    const onSave = vi.fn();

    render(
      <ProfileSettingsDisplayNameTab
        displayName="Alice"
        isSaving={false}
        isSavePending={false}
        hasChanges
        errorMessage="Display name is invalid"
        onDisplayNameChange={onDisplayNameChange}
        onReset={onReset}
        onSave={onSave}
      />,
    );

    const input = screen.getByDisplayValue("Alice");
    await user.type(input, " Updated");

    expect(onDisplayNameChange).toHaveBeenCalled();
    expect(screen.getByText("Display name is invalid")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables input and actions while saving", () => {
    render(
      <ProfileSettingsDisplayNameTab
        displayName="Alice"
        isSaving
        isSavePending
        hasChanges
        errorMessage={null}
        onDisplayNameChange={vi.fn()}
        onReset={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Alice")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving" })).toBeDisabled();
  });
});
