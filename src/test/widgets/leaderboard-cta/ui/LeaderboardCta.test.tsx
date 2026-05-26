import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { mockMatchMedia } from "@/test/helpers/matchMedia";
import { LeaderboardCta, type LeaderboardCtaSnapshot } from "@/widgets/leaderboard-cta";

describe("LeaderboardCta", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  it("renders leaderboard CTA content from snapshot", () => {
    const snapshot: LeaderboardCtaSnapshot = {
      title: "Climb the leaderboard",
      description: "Challenge other developers and improve your ranking.",
      actionLabel: "Start competing",
      actionHref: "/arena",
    };

    render(<LeaderboardCta snapshot={snapshot} />);

    expect(
      screen.getByRole("heading", {
        name: snapshot.title,
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(snapshot.description)).toBeInTheDocument();

    const actionLink = screen.getByRole("link", {
      name: snapshot.actionLabel,
    });

    expect(actionLink).toHaveAttribute("href", snapshot.actionHref);
  });
});
