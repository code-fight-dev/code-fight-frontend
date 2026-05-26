import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AvatarSection } from "@/views/viewer-profile/ui/AvatarSection";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}));

describe("views/viewer-profile/ui/AvatarSection", () => {
  it("renders uploaded/provider avatar image and provider hint", () => {
    render(
      <AvatarSection
        username="alice"
        avatarUrl="https://example.com/avatar.png"
        avatarSource="provider"
        isEditable
        isSaving={false}
        errorMessage={null}
        onFileChange={vi.fn()}
        onRemoveCustomAvatar={vi.fn()}
      />,
    );

    expect(screen.getByRole("img", { name: "alice avatar" })).toBeInTheDocument();
    expect(
      screen.getByText("Provider avatar is active. Upload a custom image any time."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Remove Custom/i }),
    ).not.toBeInTheDocument();
  });

  it("renders generated initial when avatar should not be shown", () => {
    render(
      <AvatarSection
        username="alice"
        avatarUrl=""
        avatarSource="none"
        isEditable={false}
        isSaving={false}
        errorMessage={null}
        onFileChange={vi.fn()}
        onRemoveCustomAvatar={vi.fn()}
      />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByText("Avatar is managed by the profile owner."),
    ).toBeInTheDocument();
  });

  it("handles file upload and custom avatar removal", () => {
    const onFileChange = vi.fn();
    const onRemoveCustomAvatar = vi.fn();

    render(
      <AvatarSection
        username="alice"
        avatarUrl="https://example.com/avatar.png"
        avatarSource="custom"
        isEditable
        isSaving={false}
        errorMessage={null}
        onFileChange={onFileChange}
        onRemoveCustomAvatar={onRemoveCustomAvatar}
      />,
    );

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Upload Avatar"), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /Remove Custom/i }));

    expect(onFileChange).toHaveBeenCalledWith(file);
    expect(onRemoveCustomAvatar).toHaveBeenCalledTimes(1);
  });

  it("shows upload error message when present", () => {
    render(
      <AvatarSection
        username="alice"
        avatarUrl="https://example.com/avatar.png"
        avatarSource="custom"
        isEditable
        isSaving={false}
        errorMessage="Avatar upload failed"
        onFileChange={vi.fn()}
        onRemoveCustomAvatar={vi.fn()}
      />,
    );

    expect(screen.getByText("Avatar upload failed")).toBeInTheDocument();
  });
});
