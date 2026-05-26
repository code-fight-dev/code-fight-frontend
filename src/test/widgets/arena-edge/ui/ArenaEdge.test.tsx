import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ArenaEdge } from "@/widgets/arena-edge";
import type { ArenaEdgeSnapshot } from "@/widgets/arena-edge";

vi.mock("@/shared/ui/Container", () => ({
  Container: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({
    children,
    className,
    delay,
    variant,
  }: {
    children: ReactNode;
    className?: string;
    delay?: number;
    variant?: string;
  }) => (
    <div
      data-testid="reveal"
      data-delay={String(delay ?? 0)}
      data-variant={variant ?? ""}
      className={className}
    >
      {children}
    </div>
  ),
}));

function createSnapshot(): ArenaEdgeSnapshot {
  return {
    eyebrow: "The Arena Edge",
    title: "Engineered for Competition",
    description: "Battle-tested systems designed for high-signal ranked play.",
    cards: [
      {
        id: "real-time-coding",
        icon: "realtime",
        title: "Real-time Coding Arena",
        description: "Write code under pressure with instant execution feedback.",
      },
      {
        id: "elo-system",
        icon: "elo",
        title: "Dynamic ELO Ratings",
        description: "Skill-adjusted matchmaking keeps each duel meaningful.",
      },
      {
        id: "replay-suite",
        icon: "replay",
        title: "Match Replay Suite",
        description: "Review every round and identify strategic improvements.",
      },
    ],
  };
}

describe("widgets/arena-edge/ui/ArenaEdge", () => {
  it("renders heading content and all arena edge cards", () => {
    render(<ArenaEdge snapshot={createSnapshot()} />);

    expect(screen.getByText("The Arena Edge")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Engineered for Competition" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Battle-tested systems designed for high-signal ranked play."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Real-time Coding Arena" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dynamic ELO Ratings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Match Replay Suite" }),
    ).toBeInTheDocument();

    expect(document.querySelectorAll("svg").length).toBe(3);
  });

  it("applies configured reveal delays and last-card layout branch", () => {
    render(<ArenaEdge snapshot={createSnapshot()} />);

    const reveals = screen.getAllByTestId("reveal");
    const delayValues = reveals.map((element) => element.getAttribute("data-delay"));

    expect(delayValues).toContain("40");
    expect(delayValues).toContain("0");
    expect(delayValues).toContain("90");
    expect(delayValues).toContain("180");

    const firstCardReveal = screen
      .getByRole("heading", { name: "Real-time Coding Arena" })
      .closest('[data-testid="reveal"]');
    const lastCardReveal = screen
      .getByRole("heading", { name: "Match Replay Suite" })
      .closest('[data-testid="reveal"]');

    expect(firstCardReveal).not.toHaveClass("md:col-span-2");
    expect(lastCardReveal).toHaveClass("md:col-span-2");
    expect(lastCardReveal).toHaveClass("xl:col-span-1");
    expect(lastCardReveal).toHaveAttribute("data-variant", "scale");
  });
});
