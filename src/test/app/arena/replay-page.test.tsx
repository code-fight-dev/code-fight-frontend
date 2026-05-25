import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";
import { createViewerWithUsername } from "@/test/fixtures/viewer";

describe("app/arena/replay/[matchId]/page", () => {
  it("exposes stable metadata", async () => {
    const pageModule = await loadPageModule(
      () => import("@/app/arena/replay/[matchId]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: vi.fn(),
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: vi.fn(),
        }));
        vi.doMock("@/views/arena-replay-room", () => ({
          ArenaReplayRoomPageView: vi.fn(() => null),
        }));
      },
    );

    expect(pageModule.metadata).toEqual({
      title: "Arena Replay | CodeFight",
      description: "Watch completed coding duels with timeline playback.",
    });
  });

  it("redirects guests to sign in", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(null);
    const ArenaReplayRoomPageViewMock = vi.fn(() => <div>replay room</div>);

    const { default: ArenaReplayPage } = await loadPageModule(
      () => import("@/app/arena/replay/[matchId]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/views/arena-replay-room", () => ({
          ArenaReplayRoomPageView: ArenaReplayRoomPageViewMock,
        }));
      },
    );

    await expect(
      ArenaReplayPage({
        params: Promise.resolve({
          matchId: "match-1",
        }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/signin");
    expect(ArenaReplayRoomPageViewMock).not.toHaveBeenCalled();
  });

  it("renders replay room for authenticated viewer", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi
      .fn()
      .mockResolvedValue(createViewerWithUsername("alice"));
    const ArenaReplayRoomPageViewMock = vi.fn(({ matchId }: { matchId: string }) => (
      <div data-testid="arena-replay-room">{matchId}</div>
    ));

    const { default: ArenaReplayPage } = await loadPageModule(
      () => import("@/app/arena/replay/[matchId]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/views/arena-replay-room", () => ({
          ArenaReplayRoomPageView: ArenaReplayRoomPageViewMock,
        }));
      },
    );
    const element = await ArenaReplayPage({
      params: Promise.resolve({
        matchId: "match-77",
      }),
    });

    render(element);

    expect(getCurrentViewerServerMock).toHaveBeenCalledTimes(1);
    expect(getFirstCallProps(ArenaReplayRoomPageViewMock)).toEqual({
      matchId: "match-77",
    });
    expect(screen.getByTestId("arena-replay-room")).toHaveTextContent("match-77");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
