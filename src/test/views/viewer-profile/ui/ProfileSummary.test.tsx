import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { createViewerProfileFixture } from "@/test/features/profile-settings/model/fixtures";
import { ProfileSummary } from "@/views/viewer-profile/ui/ProfileSummary";

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

describe("views/viewer-profile/ui/ProfileSummary", () => {
  it("renders owner profile details with edit action and avatar image", () => {
    const profile = createViewerProfileFixture({
      displayName: "",
      bio: "",
      city: "",
      stateProvince: "California",
      country: "United States",
      avatarUrl: "https://example.com/custom-avatar.png",
      avatarSource: "custom",
    });

    render(
      <ProfileSummary
        profile={profile}
        rankTier="B"
        rankColor="#3b82f6"
        joinedLabel="May 2026"
        isOwner
      />,
    );

    expect(screen.getByRole("heading", { name: "alice" })).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
    expect(
      screen.getByText("This player has not added a public bio yet."),
    ).toBeInTheDocument();
    expect(screen.getByText("California, United States")).toBeInTheDocument();
    expect(screen.getByText("Joined May 2026")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "alice avatar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit Profile/i })).toHaveAttribute(
      "href",
      "/settings/profile",
    );
  });

  it("renders generated avatar fallback and hides location/edit controls for visitors", () => {
    const profile = createViewerProfileFixture({
      username: "nova",
      displayName: "Nova Prime",
      country: "",
      stateProvince: "",
      city: "",
      avatarUrl: "",
      avatarSource: "none",
    });

    render(
      <ProfileSummary
        profile={profile}
        rankTier="C"
        rankColor="#22d3ee"
        joinedLabel="April 2026"
        isOwner={false}
      />,
    );

    expect(screen.getByRole("heading", { name: "Nova Prime" })).toBeInTheDocument();
    expect(screen.getByText("N")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Edit Profile/i })).not.toBeInTheDocument();
    expect(screen.queryByText("United States")).not.toBeInTheDocument();
    expect(screen.getByText("Joined April 2026")).toBeInTheDocument();
  });
});
