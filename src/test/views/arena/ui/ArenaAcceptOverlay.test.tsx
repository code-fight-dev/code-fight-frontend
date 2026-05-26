import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArenaAcceptOverlay } from "@/views/arena/ui/ArenaAcceptOverlay";

describe("views/arena/ui/ArenaAcceptOverlay", () => {
  it("returns null when overlay is not visible", () => {
    const { container } = render(
      <ArenaAcceptOverlay
        visible={false}
        acceptRemainingSeconds={45}
        selfAccepted={false}
        opponentAccepted={false}
        isBusy={false}
        onAccept={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders accept state and triggers accept handler", () => {
    const onAccept = vi.fn();

    render(
      <ArenaAcceptOverlay
        visible
        acceptRemainingSeconds={65}
        selfAccepted={false}
        opponentAccepted
        isBusy={false}
        onAccept={onAccept}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Accept window 01:05")).toBeInTheDocument();
    expect(screen.getByText("You:")).toBeInTheDocument();
    expect(screen.getByText("Opponent:")).toBeInTheDocument();
    expect(screen.getByText("Waiting")).toBeInTheDocument();
    expect(screen.getAllByText("Accepted")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Accept match" }));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("disables accept button when self already accepted or request is busy", () => {
    const { rerender } = render(
      <ArenaAcceptOverlay
        visible
        acceptRemainingSeconds={20}
        selfAccepted
        opponentAccepted={false}
        isBusy={false}
        onAccept={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Accepted" })).toBeDisabled();

    rerender(
      <ArenaAcceptOverlay
        visible
        acceptRemainingSeconds={20}
        selfAccepted={false}
        opponentAccepted={false}
        isBusy
        onAccept={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Accept match" })).toBeDisabled();
  });
});
