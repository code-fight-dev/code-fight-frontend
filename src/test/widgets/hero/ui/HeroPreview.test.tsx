import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

vi.mock("@/widgets/hero/ui/HeroTypingSnippet", () => ({
  HeroTypingSnippet: () => (
    <span data-testid="hero-typing-snippet">
      {"    best_move = search(frontier, grid)"}
    </span>
  ),
}));

import { HeroPreview } from "@/widgets/hero/testing";

describe("widgets/hero/ui/HeroPreview", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "disabled";
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
  });

  it("renders preview shell, code snippet and metric cards", () => {
    render(<HeroPreview />);

    expect(screen.getByText("match_preview.py")).toBeInTheDocument();
    expect(screen.getByTestId("hero-typing-snippet")).toBeInTheDocument();
    expect(screen.getByText("Latency")).toBeInTheDocument();
    expect(screen.getByText("14ms")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Syncing")).toBeInTheDocument();
    expect(screen.getByText("def")).toBeInTheDocument();
    expect(screen.getByText("evaluate_move")).toBeInTheDocument();
  });
});
