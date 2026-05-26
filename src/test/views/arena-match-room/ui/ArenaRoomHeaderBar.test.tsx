import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ArenaRoomHeaderBar } from "@/views/arena-match-room/ui/ArenaRoomHeaderBar";

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

describe("views/arena-match-room/ui/ArenaRoomHeaderBar", () => {
  it("renders match metadata and enables surrender button for running matches", () => {
    const onSurrenderClick = vi.fn();

    render(
      <ArenaRoomHeaderBar
        matchId="match-abcdef12"
        opponentId="opponent-12345678"
        status="running"
        isSurrendering={false}
        onSurrenderClick={onSurrenderClick}
      />,
    );

    expect(screen.getByRole("link", { name: "Back to arena" })).toHaveAttribute(
      "href",
      "/arena",
    );
    expect(screen.getByText("Match #MATCH-AB")).toBeInTheDocument();
    expect(screen.getByText("Opponent OPPONENT")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();

    const surrenderButton = screen.getByRole("button", { name: "Surrender" });
    expect(surrenderButton).toBeEnabled();

    fireEvent.click(surrenderButton);
    expect(onSurrenderClick).toHaveBeenCalledTimes(1);
  });

  it("disables surrender button for non-running matches or while surrendering", () => {
    const onSurrenderClick = vi.fn();
    const { rerender } = render(
      <ArenaRoomHeaderBar
        matchId="match-abcdef12"
        opponentId="opponent-12345678"
        status="finished"
        isSurrendering={false}
        onSurrenderClick={onSurrenderClick}
      />,
    );

    expect(screen.getByRole("button", { name: "Surrender" })).toBeDisabled();

    rerender(
      <ArenaRoomHeaderBar
        matchId="match-abcdef12"
        opponentId="opponent-12345678"
        status="running"
        isSurrendering
        onSurrenderClick={onSurrenderClick}
      />,
    );

    expect(screen.getByRole("button", { name: "Surrendering" })).toBeDisabled();
  });
});
