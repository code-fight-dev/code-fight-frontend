import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/ranking/page", () => {
  it("renders ranking view", async () => {
    const RankingPageViewMock = vi.fn(() => (
      <div data-testid="ranking-page-view">Ranking</div>
    ));

    const { default: RankingPage, metadata } = await loadPageModule(
      () => import("@/app/ranking/page"),
      () => {
        vi.doMock("@/views/ranking", () => ({
          RankingPageView: RankingPageViewMock,
        }));
      },
    );

    render(<RankingPage />);

    expect(RankingPageViewMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("ranking-page-view")).toHaveTextContent("Ranking");
    expect(metadata).toEqual({
      title: "Ranking | CodeFight",
      description:
        "Explore CodeFight rank tiers, progression milestones, and competitive ladder details.",
      alternates: {
        canonical: "/ranking",
      },
    });
  });
});
