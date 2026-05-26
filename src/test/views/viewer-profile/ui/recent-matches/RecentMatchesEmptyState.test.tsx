import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecentMatchesEmptyState } from "@/views/viewer-profile/ui/recent-matches/RecentMatchesEmptyState";

describe("views/viewer-profile/ui/recent-matches/RecentMatchesEmptyState", () => {
  it("renders empty state title and description", () => {
    render(
      <RecentMatchesEmptyState description="Matches will appear here after your first duel." />,
    );

    expect(screen.getByText("No recent matches yet")).toBeInTheDocument();
    expect(
      screen.getByText("Matches will appear here after your first duel."),
    ).toBeInTheDocument();
  });
});
