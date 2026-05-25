import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/leaderboard/page", () => {
  it("parses search params, loads leaderboard data and renders view", async () => {
    const rawSearchParams = {
      mode: "global",
      page: "2",
      pageSize: "25",
    };
    const parsedQuery = {
      mode: "global",
      page: 2,
      pageSize: 25,
    };
    const leaderboardData = {
      page: {
        index: 2,
        size: 25,
        totalItems: 50,
      },
      podiumItems: [
        {
          username: "alice",
        },
      ],
    };

    const parseLeaderboardViewQueryMock = vi.fn().mockReturnValue(parsedQuery);
    const getLeaderboardViewDataMock = vi.fn().mockResolvedValue(leaderboardData);
    const LeaderboardPageViewMock = vi.fn(
      ({ page, podiumItems }: { page: unknown; podiumItems: unknown }) => (
        <div data-testid="leaderboard-page-view">
          {JSON.stringify({
            page,
            podiumItems,
          })}
        </div>
      ),
    );

    const { default: LeaderboardPage } = await loadPageModule(
      () => import("@/app/leaderboard/page"),
      () => {
        vi.doMock("@/views/leaderboard", () => ({
          parseLeaderboardViewQuery: parseLeaderboardViewQueryMock,
          getLeaderboardViewData: getLeaderboardViewDataMock,
          LeaderboardPageView: LeaderboardPageViewMock,
        }));
      },
    );
    const element = await LeaderboardPage({
      params: Promise.resolve({}),
      searchParams: Promise.resolve(rawSearchParams),
    });

    render(element);

    expect(parseLeaderboardViewQueryMock).toHaveBeenCalledWith(rawSearchParams);
    expect(getLeaderboardViewDataMock).toHaveBeenCalledWith({
      mode: "global",
      page: 2,
      pageSize: 25,
    });
    expect(getFirstCallProps(LeaderboardPageViewMock)).toEqual({
      page: leaderboardData.page,
      podiumItems: leaderboardData.podiumItems,
    });
    expect(screen.getByTestId("leaderboard-page-view")).toHaveTextContent(
      '"username":"alice"',
    );
  });
});
