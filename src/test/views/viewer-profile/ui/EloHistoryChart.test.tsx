import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ViewerProfileEloHistoryPoint } from "@/entities/viewer";
import { EloHistoryChart } from "@/views/viewer-profile/ui/EloHistoryChart";

function createPoint(
  date: string,
  overrides: Partial<ViewerProfileEloHistoryPoint> = {},
): ViewerProfileEloHistoryPoint {
  return {
    date,
    delta: 0,
    rating: 1500,
    matchesPlayed: 1,
    ...overrides,
  };
}

describe("views/viewer-profile/ui/EloHistoryChart", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders empty state and range controls when no history points exist", () => {
    render(<EloHistoryChart points={[]} accentColor="#3b82f6" />);

    expect(screen.getByRole("heading", { name: "Elo History" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1Y" })).toBeInTheDocument();
    expect(
      screen.getByText("Elo changes will appear here after rated matches are completed."),
    ).toBeInTheDocument();
  });

  it("renders empty state when selected range has no visible points", () => {
    render(
      <EloHistoryChart
        accentColor="#60a5fa"
        points={[
          createPoint("2026-02-10T12:00:00.000Z", {
            rating: 1300,
            delta: 10,
            matchesPlayed: 1,
          }),
        ]}
      />,
    );

    expect(screen.queryByText(/Elo changes will appear here/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "1M" }));

    expect(
      screen.getByText("Elo changes will appear here after rated matches are completed."),
    ).toBeInTheDocument();
  });

  it("renders points, updates tooltip on hover, and applies selected range filtering", () => {
    render(
      <EloHistoryChart
        accentColor="#22d3ee"
        points={[
          createPoint("2026-02-10T12:00:00.000Z", {
            delta: 10,
            rating: 1400,
            matchesPlayed: 1,
          }),
          createPoint("2026-03-20T12:00:00.000Z", {
            delta: -5,
            rating: 1450,
            matchesPlayed: 2,
          }),
          createPoint("2026-05-25T12:00:00.000Z", {
            delta: 25,
            rating: 1500,
            matchesPlayed: 3,
          }),
        ]}
      />,
    );

    expect(
      screen.queryByText(/will appear here after rated matches/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText("1500 Elo")).toBeInTheDocument();
    expect(screen.getByText("+25 this period")).toBeInTheDocument();
    expect(screen.getByText("3 rated matches")).toBeInTheDocument();

    const firstPoint = screen.getByRole("button", {
      name: /Feb\s+10\s+\+10 Elo/i,
    });
    fireEvent.mouseEnter(firstPoint);

    expect(screen.getByText("1400 Elo")).toBeInTheDocument();
    expect(screen.getByText("+10 this period")).toBeInTheDocument();
    expect(screen.getByText("1 rated match")).toBeInTheDocument();

    const tooltip = screen.getByText("1400 Elo").parentElement;
    expect(tooltip).toHaveStyle({ left: "18%" });

    const negativePoint = screen.getByRole("button", {
      name: /Mar\s+20\s+-5 Elo/i,
    });
    fireEvent.mouseEnter(negativePoint);

    expect(screen.getByText("1450 Elo")).toBeInTheDocument();
    expect(screen.getByText("-5 this period")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "1M" }));

    expect(screen.queryByRole("button", { name: /Feb\s+10\s+\+10 Elo/i })).toBeNull();
    expect(screen.getByText("1500 Elo")).toBeInTheDocument();
  });

  it("updates and clears tooltip on focus, blur, and mouse leave", () => {
    render(
      <EloHistoryChart
        accentColor="#60a5fa"
        points={[
          createPoint("2026-05-25T12:00:00.000Z", {
            delta: 2,
            rating: 1502,
            matchesPlayed: 3,
          }),
        ]}
      />,
    );

    const firstPoint = screen.getByRole("button", { name: /May\s+25\s+\+2 Elo/i });

    fireEvent.focus(firstPoint);
    expect(screen.getByText("1502 Elo")).toBeInTheDocument();
    expect(screen.getByText("+2 this period")).toBeInTheDocument();

    fireEvent.blur(firstPoint);
    expect(screen.getByText("1502 Elo")).toBeInTheDocument();
    expect(screen.getByText("+2 this period")).toBeInTheDocument();

    fireEvent.mouseEnter(firstPoint);
    expect(screen.getByText("1502 Elo")).toBeInTheDocument();

    fireEvent.mouseLeave(firstPoint);
    expect(screen.getByText("1502 Elo")).toBeInTheDocument();
  });
});
