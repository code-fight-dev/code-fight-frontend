import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfileSettingsFormActions } from "@/features/profile-settings/ui/ProfileSettingsFormActions";

describe("features/profile-settings/ui/ProfileSettingsFormActions", () => {
  it("calls reset and save handlers when actions are enabled", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onSave = vi.fn();

    render(
      <ProfileSettingsFormActions
        hasChanges
        isSavePending={false}
        isSaving={false}
        onReset={onReset}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables actions when there are no changes or while saving", () => {
    const { rerender } = render(
      <ProfileSettingsFormActions
        hasChanges={false}
        isSavePending={false}
        isSaving={false}
        onReset={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    rerender(
      <ProfileSettingsFormActions
        hasChanges
        isSavePending={false}
        isSaving
        onReset={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("passes pending state to save button and merges custom class", () => {
    const { container } = render(
      <ProfileSettingsFormActions
        className="actions-extra-class"
        hasChanges
        isSavePending
        isSaving={false}
        onReset={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Saving" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(container.firstElementChild).toHaveClass("actions-extra-class");
  });
});
