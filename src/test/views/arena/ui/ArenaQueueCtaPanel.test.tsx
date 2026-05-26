import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ArenaQueueCtaPanel } from "@/views/arena/ui/ArenaQueueCtaPanel";

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

describe("views/arena/ui/ArenaQueueCtaPanel", () => {
  it("renders sign-in link for guests", () => {
    render(
      <ArenaQueueCtaPanel
        isGuest
        state="idle"
        queueSettings={{ taskMode: "normal", isRated: true }}
        searchElapsedSeconds={0}
        isSseConnected
        isBusy={false}
        errorMessage={null}
        onStart={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "Sign in to queue" })).toHaveAttribute(
      "href",
      "/signin",
    );
    expect(
      screen.queryByRole("button", { name: "Start matchmaking" }),
    ).not.toBeInTheDocument();
  });

  it("renders searching state with cancel action and degraded realtime message", () => {
    const onCancel = vi.fn();

    render(
      <ArenaQueueCtaPanel
        isGuest={false}
        state="searching"
        queueSettings={{ taskMode: "hard", isRated: false }}
        searchElapsedSeconds={75}
        isSseConnected={false}
        isBusy={false}
        errorMessage="Matchmaking temporarily unavailable."
        onStart={vi.fn()}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole("button", { name: "Searching 01:15" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Cancel matchmaking" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Unrated")).toBeInTheDocument();
    expect(screen.getByText("Realtime degraded, polling active")).toBeInTheDocument();
    expect(screen.getByText("Matchmaking temporarily unavailable.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel matchmaking" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders start button for authenticated viewer and runs start action", () => {
    const onStart = vi.fn();

    render(
      <ArenaQueueCtaPanel
        isGuest={false}
        state="error"
        queueSettings={{ taskMode: "normal", isRated: true }}
        searchElapsedSeconds={42}
        isSseConnected
        isBusy={false}
        errorMessage={null}
        onStart={onStart}
        onCancel={vi.fn()}
      />,
    );

    const startButton = screen.getByRole("button", { name: "Start matchmaking" });
    expect(startButton).toBeEnabled();
    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByText("Rated")).toBeInTheDocument();
    expect(screen.getByText("Realtime online")).toBeInTheDocument();

    fireEvent.click(startButton);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("shows busy state and disables start while request is pending", () => {
    const { container } = render(
      <ArenaQueueCtaPanel
        isGuest={false}
        state="idle"
        queueSettings={{ taskMode: "normal", isRated: true }}
        searchElapsedSeconds={12}
        isSseConnected
        isBusy
        errorMessage={null}
        onStart={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Start matchmaking" })).toBeDisabled();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
