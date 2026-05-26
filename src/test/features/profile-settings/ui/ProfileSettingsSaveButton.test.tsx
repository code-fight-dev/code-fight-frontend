import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfileSettingsSaveButton } from "@/features/profile-settings/ui/ProfileSettingsSaveButton";

describe("features/profile-settings/ui/ProfileSettingsSaveButton", () => {
  it("renders idle state", () => {
    render(
      <ProfileSettingsSaveButton disabled={false} isPending={false} onClick={vi.fn()} />,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("aria-busy", "false");
    expect(screen.queryByText("Saving")).not.toBeInTheDocument();
  });

  it("renders pending state with busy attribute", () => {
    render(<ProfileSettingsSaveButton disabled={false} isPending onClick={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("calls onClick when enabled and blocks click when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { rerender } = render(
      <ProfileSettingsSaveButton
        disabled={false}
        isPending={false}
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(
      <ProfileSettingsSaveButton disabled isPending={false} onClick={handleClick} />,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
