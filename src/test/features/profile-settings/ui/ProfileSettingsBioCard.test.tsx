import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PROFILE_BIO_LIMIT } from "@/features/profile-settings/model/constants";
import { ProfileSettingsBioCard } from "@/features/profile-settings/ui/ProfileSettingsBioCard";

describe("features/profile-settings/ui/ProfileSettingsBioCard", () => {
  it("renders bio, counter and placeholder", () => {
    render(
      <ProfileSettingsBioCard
        bio="Hello there"
        isSaving={false}
        isSavePending={false}
        hasChanges={false}
        errorMessage={null}
        onBioChange={vi.fn()}
        onReset={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText(`11/${PROFILE_BIO_LIMIT}`)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hello there")).toHaveAttribute(
      "placeholder",
      "Tell others what kind of coder you are, what you enjoy building, or how you compete.",
    );
  });

  it("slices bio input value by limit and supports reset/save actions", async () => {
    const user = userEvent.setup();
    const onBioChange = vi.fn();
    const onReset = vi.fn();
    const onSave = vi.fn();

    render(
      <ProfileSettingsBioCard
        bio=""
        isSaving={false}
        isSavePending={false}
        hasChanges
        errorMessage="Bio is too long"
        onBioChange={onBioChange}
        onReset={onReset}
        onSave={onSave}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "Tell others what kind of coder you are, what you enjoy building, or how you compete.",
    );
    fireEvent.change(textarea, {
      target: {
        value: "A".repeat(PROFILE_BIO_LIMIT + 5),
      },
    });

    const lastCallValue = onBioChange.mock.calls.at(-1)?.[0];
    expect(lastCallValue).toHaveLength(PROFILE_BIO_LIMIT);
    expect(screen.getByText("Bio is too long")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables textarea and actions while saving", () => {
    render(
      <ProfileSettingsBioCard
        bio="Hello"
        isSaving
        isSavePending
        hasChanges
        errorMessage={null}
        onBioChange={vi.fn()}
        onReset={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Hello")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving" })).toBeDisabled();
  });
});
