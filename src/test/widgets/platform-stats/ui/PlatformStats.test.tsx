import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { mockMatchMedia } from "@/test/helpers/matchMedia";
import { PlatformStats, type PlatformStat } from "@/widgets/platform-stats";

describe("PlatformStats", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  it("renders all platform stats", () => {
    const stats: PlatformStat[] = [
      {
        id: "active-players",
        label: "Active players",
        value: "12K+",
        badge: "+18%",
        badgeTone: "success",
      },
      {
        id: "matches-played",
        label: "Matches played",
        value: "48K",
        badge: "Live",
        badgeTone: "info",
      },
      {
        id: "code-runs",
        label: "Code runs",
        value: "130K",
        badge: "+32%",
        badgeTone: "success",
      },
    ];

    render(<PlatformStats stats={stats} />);

    for (const stat of stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
      expect(screen.getByText(stat.badge)).toBeInTheDocument();
    }
  });
});
