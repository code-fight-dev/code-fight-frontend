import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeaderboardPaginationControls } from "@/features/leaderboard-navigation/ui/LeaderboardPaginationControls";

describe("features/leaderboard-navigation/ui/LeaderboardPaginationControls", () => {
  it("renders formatted page counters and triggers prev/next callbacks", () => {
    const onPrevPage = vi.fn();
    const onNextPage = vi.fn();

    render(
      <LeaderboardPaginationControls
        currentPage={1000}
        totalPages={2500}
        canGoPrevPage
        canGoNextPage
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />,
    );

    expect(screen.getByText("Page 1,000 / 2,500")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Prev" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPrevPage).toHaveBeenCalledTimes(1);
    expect(onNextPage).toHaveBeenCalledTimes(1);
  });

  it("disables prev/next buttons when navigation is unavailable", () => {
    const onPrevPage = vi.fn();
    const onNextPage = vi.fn();

    render(
      <LeaderboardPaginationControls
        currentPage={1}
        totalPages={1}
        canGoPrevPage={false}
        canGoNextPage={false}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />,
    );

    const prevButton = screen.getByRole("button", { name: "Prev" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    fireEvent.click(prevButton);
    fireEvent.click(nextButton);

    expect(onPrevPage).not.toHaveBeenCalled();
    expect(onNextPage).not.toHaveBeenCalled();
  });
});
