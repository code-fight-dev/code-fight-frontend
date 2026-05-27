import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SecuritySettingsPage from "@/app/settings/security/page";

describe("app/settings/security/page", () => {
  it("renders security panel with recovery flow link", () => {
    render(<SecuritySettingsPage />);

    expect(
      screen.getByRole("heading", { name: "Password Recovery", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Recovery Flow" })).toHaveAttribute(
      "href",
      "/recovery",
    );
  });
});
