import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";
import { createViewerWithUsername } from "@/test/fixtures/viewer";

describe("app/arena/match/[matchId]/page", () => {
  it("exposes stable metadata", async () => {
    const pageModule = await loadPageModule(
      () => import("@/app/arena/match/[matchId]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: vi.fn(),
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: vi.fn(),
        }));
        vi.doMock("@/views/arena-match-room", () => ({
          ArenaMatchRoomPageView: vi.fn(() => null),
        }));
      },
    );

    expect(pageModule.metadata).toEqual({
      title: "Arena Match | CodeFight",
      description: "Live arena duel room for head-to-head coding matches.",
    });
  });

  it("redirects guests to sign in", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(null);
    const ArenaMatchRoomPageViewMock = vi.fn(() => <div>match room</div>);

    const { default: ArenaMatchPage } = await loadPageModule(
      () => import("@/app/arena/match/[matchId]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/views/arena-match-room", () => ({
          ArenaMatchRoomPageView: ArenaMatchRoomPageViewMock,
        }));
      },
    );

    await expect(
      ArenaMatchPage({
        params: Promise.resolve({
          matchId: "match-1",
        }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/signin");
    expect(ArenaMatchRoomPageViewMock).not.toHaveBeenCalled();
  });

  it("renders match room for authenticated viewer", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi
      .fn()
      .mockResolvedValue(createViewerWithUsername("alice"));
    const ArenaMatchRoomPageViewMock = vi.fn(({ matchId }: { matchId: string }) => (
      <div data-testid="arena-match-room">{matchId}</div>
    ));

    const { default: ArenaMatchPage } = await loadPageModule(
      () => import("@/app/arena/match/[matchId]/page"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
        vi.doMock("@/views/arena-match-room", () => ({
          ArenaMatchRoomPageView: ArenaMatchRoomPageViewMock,
        }));
      },
    );
    const element = await ArenaMatchPage({
      params: Promise.resolve({
        matchId: "match-42",
      }),
    });

    render(element);

    expect(getCurrentViewerServerMock).toHaveBeenCalledTimes(1);
    expect(getFirstCallProps(ArenaMatchRoomPageViewMock)).toEqual({
      matchId: "match-42",
    });
    expect(screen.getByTestId("arena-match-room")).toHaveTextContent("match-42");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
