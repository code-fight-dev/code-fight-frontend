import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileSection } from "@/views/viewer-profile/ui/ProfileSection";

describe("views/viewer-profile/ui/ProfileSection", () => {
  it("renders title, description, actions and children with custom classes", () => {
    const { container } = render(
      <ProfileSection
        title="Section Title"
        description="Section description"
        actions={<button type="button">Action</button>}
        className="custom-shell"
        contentClassName="custom-content"
      >
        <div>Section body</div>
      </ProfileSection>,
    );

    expect(screen.getByRole("heading", { name: "Section Title" })).toBeInTheDocument();
    expect(screen.getByText("Section description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    expect(screen.getByText("Section body")).toBeInTheDocument();

    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-shell");

    expect(container.querySelector(".custom-content")).toBeInTheDocument();
  });

  it("omits optional description and actions when not provided", () => {
    render(
      <ProfileSection title="Minimal section">
        <div>Only body</div>
      </ProfileSection>,
    );

    expect(screen.getByRole("heading", { name: "Minimal section" })).toBeInTheDocument();
    expect(screen.getByText("Only body")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
