import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArenaSurrenderConfirmDialog } from "@/views/arena-match-room/ui/ArenaSurrenderConfirmDialog";

describe("views/arena-match-room/ui/ArenaSurrenderConfirmDialog", () => {
  it("returns null when dialog is closed", () => {
    const { container } = render(
      <ArenaSurrenderConfirmDialog
        isOpen={false}
        isSurrendering={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders confirmation dialog and handles close/confirm actions", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ArenaSurrenderConfirmDialog
        isOpen
        isSurrendering={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Surrender this match?" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close surrender confirmation" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, surrender" }));

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables confirm button while surrender is in progress", () => {
    render(
      <ArenaSurrenderConfirmDialog
        isOpen
        isSurrendering
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Surrendering..." })).toBeDisabled();
  });
});
