import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProfileSettingsAvatarCard } from "@/features/profile-settings/ui/ProfileSettingsAvatarCard";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <div data-testid="next-image" data-src={src} data-alt={alt} {...rest} />,
}));

function renderAvatarCard(
  overrides: Partial<ComponentProps<typeof ProfileSettingsAvatarCard>> = {},
) {
  const props: ComponentProps<typeof ProfileSettingsAvatarCard> = {
    username: "alice",
    displayName: "Alice",
    avatarUrl: "",
    avatarSource: "none",
    isSaving: false,
    isSavePending: false,
    hasChanges: false,
    errorMessage: null,
    saveErrorMessage: null,
    onFileChange: vi.fn(),
    onRemoveCustomAvatar: vi.fn(),
    onReset: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };

  const result = render(<ProfileSettingsAvatarCard {...props} />);
  return { ...result, props };
}

describe("features/profile-settings/ui/ProfileSettingsAvatarCard", () => {
  it("renders generated avatar initial when image should not be shown", () => {
    renderAvatarCard({
      username: "alice",
      displayName: "",
      avatarUrl: "",
      avatarSource: "none",
    });

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.queryByTestId("next-image")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove Custom" }),
    ).not.toBeInTheDocument();
  });

  it("renders image avatar and remove-custom action for custom source", async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn();
    const onRemoveCustomAvatar = vi.fn();
    const onReset = vi.fn();
    const onSave = vi.fn();

    renderAvatarCard({
      avatarUrl: "data:image/png;base64,avatar",
      avatarSource: "custom",
      errorMessage: "Avatar file is invalid",
      saveErrorMessage: "Failed to update avatar",
      hasChanges: true,
      onFileChange,
      onRemoveCustomAvatar,
      onReset,
      onSave,
    });

    const image = screen.getByTestId("next-image");
    expect(image).toHaveAttribute("data-src", "data:image/png;base64,avatar");
    expect(image).toHaveAttribute("data-alt", "alice avatar");

    const fileInput = screen.getByLabelText("Upload Photo") as HTMLInputElement;
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    await user.upload(fileInput, file);

    expect(onFileChange).toHaveBeenCalledWith(file);
    expect(fileInput.value).toBe("");

    await user.click(screen.getByRole("button", { name: "Remove Custom" }));
    expect(onRemoveCustomAvatar).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Avatar file is invalid")).toBeInTheDocument();
    expect(screen.getByText("Failed to update avatar")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("sends null to onFileChange when no file is selected", () => {
    const onFileChange = vi.fn();
    renderAvatarCard({
      onFileChange,
    });

    const fileInput = screen.getByLabelText("Upload Photo") as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [],
      },
    });

    expect(onFileChange).toHaveBeenCalledWith(null);
  });

  it("disables file picker and actions while saving", () => {
    renderAvatarCard({
      avatarUrl: "https://example.com/avatar.png",
      avatarSource: "provider",
      isSaving: true,
      isSavePending: true,
      hasChanges: true,
    });

    expect(screen.getByLabelText("Upload Photo")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving" })).toBeDisabled();
  });
});
