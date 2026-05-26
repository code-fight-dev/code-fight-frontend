import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileSettingsSectionCard } from "@/features/profile-settings/ui/ProfileSettingsSectionCard";

describe("features/profile-settings/ui/ProfileSettingsSectionCard", () => {
  it("renders eyebrow, title, description and children", () => {
    render(
      <ProfileSettingsSectionCard
        eyebrow="General"
        title="Profile section"
        description="Section description"
      >
        <div>Section content</div>
      </ProfileSettingsSectionCard>,
    );

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Profile section" })).toBeInTheDocument();
    expect(screen.getByText("Section description")).toBeInTheDocument();
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("renders eyebrow icon and merges class names", () => {
    const { container } = render(
      <ProfileSettingsSectionCard
        eyebrow="General"
        eyebrowIcon={<span data-testid="eyebrow-icon">icon</span>}
        title="Title"
        description="Description"
        className="outer-extra-class"
        contentClassName="content-extra-class"
      >
        <div>Child</div>
      </ProfileSettingsSectionCard>,
    );

    expect(screen.getByTestId("eyebrow-icon")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("outer-extra-class");
    expect(screen.getByText("Child").parentElement).toHaveClass("content-extra-class");
  });
});
