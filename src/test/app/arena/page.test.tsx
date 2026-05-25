import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/arena/page", () => {
  it("exposes stable metadata", async () => {
    const pageModule = await loadPageModule(
      () => import("@/app/arena/page"),
      () => {
        vi.doMock("@/views/arena/server", () => ({
          getArenaPageData: vi.fn(),
        }));
        vi.doMock("@/views/arena", () => ({
          ArenaPageView: vi.fn(() => null),
        }));
      },
    );

    expect(pageModule.metadata).toEqual({
      title: "Arena | CodeFight",
      description: "PVP matchmaking and live coding duels in CodeFight Arena.",
    });
  });

  it("loads arena data and passes it to ArenaPageView", async () => {
    const pageData = {
      arenaProfile: {
        username: "alice",
      },
      metrics: {
        queuedPlayers: 10,
      },
    };

    const getArenaPageDataMock = vi.fn().mockResolvedValue(pageData);
    const ArenaPageViewMock = vi.fn(({ data }: { data: unknown }) => (
      <div data-testid="arena-page-view">{JSON.stringify(data)}</div>
    ));

    const { default: ArenaPage } = await loadPageModule(
      () => import("@/app/arena/page"),
      () => {
        vi.doMock("@/views/arena/server", () => ({
          getArenaPageData: getArenaPageDataMock,
        }));
        vi.doMock("@/views/arena", () => ({
          ArenaPageView: ArenaPageViewMock,
        }));
      },
    );
    const element = await ArenaPage();

    render(element);

    expect(getArenaPageDataMock).toHaveBeenCalledTimes(1);
    expect(getFirstCallProps(ArenaPageViewMock)).toEqual({
      data: pageData,
    });
    expect(screen.getByTestId("arena-page-view")).toHaveTextContent('"queuedPlayers":10');
  });
});
