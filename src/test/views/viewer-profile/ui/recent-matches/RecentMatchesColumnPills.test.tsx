import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RECENT_MATCH_COLUMNS } from "@/views/viewer-profile/ui/recent-matches/constants";
import { RecentMatchesColumnPills } from "@/views/viewer-profile/ui/recent-matches/RecentMatchesColumnPills";

describe("views/viewer-profile/ui/recent-matches/RecentMatchesColumnPills", () => {
  it("renders all configured desktop column pills", () => {
    render(<RecentMatchesColumnPills />);

    expect(screen.getAllByText(/.+/)).toBeTruthy();
    for (const column of RECENT_MATCH_COLUMNS) {
      expect(screen.getByText(column)).toBeInTheDocument();
    }
  });
});
