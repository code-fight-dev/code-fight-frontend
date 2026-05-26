import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatRankRange, RANKS } from "@/entities/rank";
import { RankingPageView } from "@/views/ranking";

describe("views/ranking/ui/RankingPageView", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "disabled";
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
  });

  it("renders ranking hero content and both desktop/mobile rank listings", () => {
    const { container } = render(<RankingPageView />);

    expect(screen.getByText("Ranking System")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Full rank table", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tier")).toBeInTheDocument();
    expect(screen.getByText("Rating Band")).toBeInTheDocument();
    expect(screen.getByText("Primary Focus")).toBeInTheDocument();

    const desktopRows = Array.from(container.querySelectorAll("tbody tr"));
    expect(desktopRows).toHaveLength(RANKS.length);
    expect(desktopRows[0]).not.toHaveClass("border-t");
    expect(desktopRows[1]).toHaveClass(
      "border-t",
      "border-(--app-surface-strong-border)",
    );

    expect(screen.getAllByText("Primary focus:")).toHaveLength(RANKS.length);

    const sTier = RANKS.find((rank) => rank.tier === "S");
    if (!sTier) {
      throw new Error("Missing S tier fixture");
    }

    const sTierRange = formatRankRange(sTier);
    expect(screen.getAllByText(sTierRange)).toHaveLength(2);
    expect(screen.getAllByText(sTier.summary).length).toBeGreaterThan(0);
    expect(screen.getAllByText(sTier.focus).length).toBeGreaterThan(0);
  });
});
