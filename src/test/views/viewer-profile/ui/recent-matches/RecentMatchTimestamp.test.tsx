import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecentMatchTimestamp } from "@/views/viewer-profile/ui/recent-matches/RecentMatchTimestamp";
import { formatRecentMatchFinishedAt } from "@/views/viewer-profile/model/format";

vi.mock("@/views/viewer-profile/model/format", () => ({
  formatRecentMatchFinishedAt: vi.fn(() => "formatted-time"),
}));

describe("views/viewer-profile/ui/recent-matches/RecentMatchTimestamp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses client timezone after hydration", () => {
    render(<RecentMatchTimestamp value="2026-05-01T10:00:00.000Z" />);

    expect(screen.getByText("formatted-time")).toBeInTheDocument();
    expect(formatRecentMatchFinishedAt).toHaveBeenCalledWith(
      "2026-05-01T10:00:00.000Z",
      undefined,
    );
  });

  it("uses UTC fallback for server render", () => {
    const html = renderToStaticMarkup(
      <RecentMatchTimestamp value="2026-05-01T10:00:00.000Z" />,
    );

    expect(html).toContain("formatted-time");
    expect(formatRecentMatchFinishedAt).toHaveBeenCalledWith(
      "2026-05-01T10:00:00.000Z",
      "UTC",
    );
  });
});
