import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { HeroContent, type HeroSnapshot } from "@/widgets/hero/testing";

function createSnapshot(overrides: Partial<HeroSnapshot> = {}): HeroSnapshot {
  return {
    liveLabel: "LIVE MATCHMAKING",
    queueCount: 42,
    featuredDevelopers: [
      { id: "dev-1", initials: "AL", tintClassName: "from-blue-200 to-cyan-200" },
      { id: "dev-2", initials: "BO", tintClassName: "from-emerald-200 to-lime-200" },
      { id: "dev-3", initials: "CY", tintClassName: "from-violet-200 to-fuchsia-200" },
    ],
    ...overrides,
  };
}

describe("widgets/hero/ui/HeroContent", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "disabled";
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
  });

  it("renders hero copy, actions and featured developer badges", () => {
    const snapshot = createSnapshot();

    render(<HeroContent snapshot={snapshot} />);

    expect(screen.getByText("LIVE MATCHMAKING")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Code Battles:Prove Your Logic" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "High-stakes, professional PvP coding platform. Climb the Elo ladder in real-time matches against the world's most elite developers.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Start Rating Game" })).toHaveAttribute(
      "href",
      "/arena",
    );
    expect(screen.getByRole("link", { name: "Practice Arena" })).toHaveAttribute(
      "href",
      "/challenges",
    );

    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByText("BO")).toBeInTheDocument();
    expect(screen.getByText("CY")).toBeInTheDocument();
    expect(screen.getByText("+42")).toBeInTheDocument();
    expect(screen.getByText("Developers currently in queue")).toBeInTheDocument();
  });

  it("uses compact uppercase queue badge for large queue counts", () => {
    render(<HeroContent snapshot={createSnapshot({ queueCount: 1200 })} />);

    expect(screen.getByText(/^\+\d+[A-Z]$/)).toBeInTheDocument();
  });
});
