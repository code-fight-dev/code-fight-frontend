import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EditorSettingsSectionCard,
  EditorSettingsSectionHeading,
} from "@/features/preferences/ui/editor-settings/EditorSettingsLayout";

describe("features/preferences/ui/editor-settings/EditorSettingsLayout", () => {
  it("renders section card wrapper with children", () => {
    const { container } = render(
      <EditorSettingsSectionCard>
        <div data-testid="section-content">content</div>
      </EditorSettingsSectionCard>,
    );

    const section = container.querySelector("section");

    expect(section).toHaveClass("app-settings-section");
    expect(screen.getByTestId("section-content")).toHaveTextContent("content");
  });

  it("renders section heading title and description", () => {
    render(
      <EditorSettingsSectionHeading
        title="Typography and spacing"
        description="Adjust font and code area spacing."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Typography and spacing" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Adjust font and code area spacing.")).toBeInTheDocument();
  });
});
