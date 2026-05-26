import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Hero, type HeroSnapshot } from "@/widgets/hero";

const heroUiMocks = vi.hoisted(() => ({
  HeroContent: vi.fn(() => <div data-testid="hero-content">Content</div>),
  HeroPreview: vi.fn(() => <div data-testid="hero-preview">Preview</div>),
}));

vi.mock("@/widgets/hero/ui/HeroContent", () => ({
  HeroContent: heroUiMocks.HeroContent,
}));

vi.mock("@/widgets/hero/ui/HeroPreview", () => ({
  HeroPreview: heroUiMocks.HeroPreview,
}));

function createSnapshot(overrides: Partial<HeroSnapshot> = {}): HeroSnapshot {
  return {
    liveLabel: "Live",
    queueCount: 42,
    featuredDevelopers: [
      { id: "dev-1", initials: "AL", tintClassName: "from-blue-200 to-cyan-200" },
      { id: "dev-2", initials: "BO", tintClassName: "from-emerald-200 to-lime-200" },
    ],
    ...overrides,
  };
}

describe("widgets/hero/ui/Hero", () => {
  it("renders layout shell and delegates snapshot to content and preview", () => {
    const snapshot = createSnapshot();
    const { container } = render(<Hero snapshot={snapshot} />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("relative");
    expect(container.querySelector(".app-motion-decorative")).toBeInTheDocument();

    expect(screen.getByTestId("hero-content")).toBeInTheDocument();
    expect(screen.getByTestId("hero-preview")).toBeInTheDocument();

    expect(heroUiMocks.HeroContent).toHaveBeenCalledTimes(1);
    expect(heroUiMocks.HeroContent).toHaveBeenCalledWith(
      expect.objectContaining({ snapshot }),
      undefined,
    );
    expect(heroUiMocks.HeroPreview).toHaveBeenCalledTimes(1);
    expect(heroUiMocks.HeroPreview).toHaveBeenCalledWith({}, undefined);
  });
});
