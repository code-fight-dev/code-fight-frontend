import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/page", () => {
  it("loads home data and passes it to HomePage view", async () => {
    const homeData = {
      featuredChallenges: [],
      activity: [],
      metrics: {
        activeUsers: 100,
      },
    };

    const getHomePageDataMock = vi.fn().mockResolvedValue(homeData);
    const HomePageMock = vi.fn(({ data }: { data: unknown }) => (
      <div data-testid="home-page">{JSON.stringify(data)}</div>
    ));

    const { default: HomePage, metadata } = await loadPageModule(
      () => import("@/app/page"),
      () => {
        vi.doMock("@/views/home/server", () => ({
          getHomePageData: getHomePageDataMock,
        }));
        vi.doMock("@/views/home", () => ({
          HomePage: HomePageMock,
        }));
      },
    );
    const element = await HomePage();

    render(element);

    expect(getHomePageDataMock).toHaveBeenCalledTimes(1);
    expect(getFirstCallProps(HomePageMock)).toEqual({
      data: homeData,
    });
    expect(screen.getByTestId("home-page")).toHaveTextContent('"activeUsers":100');
    expect(metadata).toEqual({
      title: "CodeFight",
      description:
        "Practice coding challenges, climb rankings, and duel in live coding arena matches.",
      alternates: {
        canonical: "/",
      },
    });
  });
});
