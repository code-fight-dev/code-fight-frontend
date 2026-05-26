import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileSettingsErrorNotice } from "@/features/profile-settings/ui/ProfileSettingsErrorNotice";

describe("features/profile-settings/ui/ProfileSettingsErrorNotice", () => {
  it("renders nothing when message is null", () => {
    const { container } = render(<ProfileSettingsErrorNotice message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders error message and merges className", () => {
    render(
      <ProfileSettingsErrorNotice
        message="Something went wrong"
        className="custom-error-class"
      />,
    );

    const notice = screen.getByText("Something went wrong");
    expect(notice).toHaveClass("custom-error-class");
  });
});
