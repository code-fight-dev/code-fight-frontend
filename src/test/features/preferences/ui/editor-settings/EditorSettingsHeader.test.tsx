import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditorSettingsHeader } from "@/features/preferences/ui/editor-settings/EditorSettingsHeader";

describe("features/preferences/ui/editor-settings/EditorSettingsHeader", () => {
  it("renders editor heading and disables reset for default preferences", () => {
    const onReset = vi.fn();

    render(<EditorSettingsHeader isDefault onReset={onReset} />);

    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Monaco workspace preferences" }),
    ).toBeInTheDocument();

    const resetButton = screen.getByRole("button", { name: "Reset defaults" });
    expect(resetButton).toBeDisabled();
  });

  it("invokes reset handler when reset button is enabled", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<EditorSettingsHeader isDefault={false} onReset={onReset} />);

    await user.click(screen.getByRole("button", { name: "Reset defaults" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
