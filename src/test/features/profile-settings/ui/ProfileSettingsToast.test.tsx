import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProfileSettingsToast } from "@/features/profile-settings/ui/ProfileSettingsToast";

const toastMock = vi.hoisted(() => ({
  Toast: vi.fn(({ message }: { message: string | null }) => (
    <div data-testid="toast-mock">{message ?? "no-message"}</div>
  )),
}));

vi.mock("@/shared/ui/Toast", () => ({
  Toast: toastMock.Toast,
}));

describe("features/profile-settings/ui/ProfileSettingsToast", () => {
  it("forwards message to shared Toast", () => {
    render(<ProfileSettingsToast message="Saved successfully" />);

    expect(toastMock.Toast).toHaveBeenCalledWith(
      { message: "Saved successfully" },
      undefined,
    );
    expect(screen.getByTestId("toast-mock")).toHaveTextContent("Saved successfully");
  });

  it("forwards null message to shared Toast", () => {
    render(<ProfileSettingsToast message={null} />);

    expect(toastMock.Toast).toHaveBeenCalledWith({ message: null }, undefined);
    expect(screen.getByTestId("toast-mock")).toHaveTextContent("no-message");
  });
});
