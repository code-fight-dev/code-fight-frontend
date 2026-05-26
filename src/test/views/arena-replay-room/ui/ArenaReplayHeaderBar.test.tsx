import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ArenaReplayHeaderBar } from "@/views/arena-replay-room/ui/ArenaReplayHeaderBar";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("views/arena-replay-room/ui/ArenaReplayHeaderBar", () => {
  it("renders replay metadata and player filters", () => {
    const onSelectPlayer = vi.fn();

    render(
      <ArenaReplayHeaderBar
        matchId="match-abcdef123456"
        status="finished_successfully"
        players={[
          {
            id: "viewer-1",
            username: "alice",
            displayName: "Alice",
            avatarUrl: "",
          },
          {
            id: "viewer-2",
            username: "bob",
            displayName: "Bob",
            avatarUrl: "",
          },
        ]}
        activePlayerId="viewer-2"
        onSelectPlayer={onSelectPlayer}
      />,
    );

    expect(screen.getByRole("link", { name: "Back to arena" })).toHaveAttribute(
      "href",
      "/arena",
    );
    expect(screen.getByText("Replay")).toBeInTheDocument();
    expect(screen.getByText("Match match-ab")).toBeInTheDocument();
    expect(screen.getByText("finished successfully")).toBeInTheDocument();

    const aliceButton = screen.getByRole("button", { name: "Alice" });
    const bobButton = screen.getByRole("button", { name: "Bob" });

    expect(aliceButton).toHaveClass("bg-white/6");
    expect(bobButton).toHaveClass("bg-blue-500/12");

    fireEvent.click(aliceButton);
    fireEvent.click(bobButton);

    expect(onSelectPlayer).toHaveBeenNthCalledWith(1, "viewer-1");
    expect(onSelectPlayer).toHaveBeenNthCalledWith(2, "viewer-2");
  });
});
