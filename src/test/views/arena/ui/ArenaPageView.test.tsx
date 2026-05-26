import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UseArenaMatchmakingResult } from "@/features/arena-matchmaking";
import { ArenaPageView } from "@/views/arena/ui/ArenaPageView";

const arenaPageMocks = vi.hoisted(() => ({
  useRouter: vi.fn(),
  useArenaMatchmaking: vi.fn(),
  ArenaQueueSettingsCard: vi.fn(),
  ArenaQueueCtaPanel: vi.fn(),
  ArenaAcceptOverlay: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: arenaPageMocks.useRouter,
}));

vi.mock("@/features/arena-matchmaking", () => ({
  useArenaMatchmaking: arenaPageMocks.useArenaMatchmaking,
}));

vi.mock("@/views/arena/ui/ArenaQueueSettingsCard", () => ({
  ArenaQueueSettingsCard: (props: Record<string, unknown>) => {
    arenaPageMocks.ArenaQueueSettingsCard(props);
    return <div data-testid="arena-queue-settings-card">settings</div>;
  },
}));

vi.mock("@/views/arena/ui/ArenaQueueCtaPanel", () => ({
  ArenaQueueCtaPanel: (props: Record<string, unknown>) => {
    arenaPageMocks.ArenaQueueCtaPanel(props);

    return (
      <div data-testid="arena-queue-cta-panel">
        <button type="button" onClick={() => (props.onStart as () => void)()}>
          Start
        </button>
        <button type="button" onClick={() => (props.onCancel as () => void)()}>
          Cancel
        </button>
      </div>
    );
  },
}));

vi.mock("@/views/arena/ui/ArenaAcceptOverlay", () => ({
  ArenaAcceptOverlay: (props: Record<string, unknown>) => {
    arenaPageMocks.ArenaAcceptOverlay(props);

    return (
      <div data-testid="arena-accept-overlay">
        <button type="button" onClick={() => (props.onAccept as () => void)()}>
          Accept
        </button>
      </div>
    );
  },
}));

const routerPushMock = vi.fn();

function createMatchmakingState(
  overrides: Partial<UseArenaMatchmakingResult> = {},
): UseArenaMatchmakingResult {
  return {
    viewerId: "viewer-1",
    state: "idle",
    queueSettings: {
      taskMode: "normal",
      isRated: true,
    },
    currentMatch: null,
    runningMatchId: null,
    searchElapsedSeconds: 0,
    acceptRemainingSeconds: 30,
    isSseConnected: true,
    isBusy: false,
    isGuest: false,
    selfAccepted: false,
    opponentAccepted: false,
    errorMessage: null,
    toastMessage: null,
    setTaskMode: vi.fn(),
    setIsRated: vi.fn(),
    startMatchmaking: vi.fn().mockResolvedValue(undefined),
    cancelMatchmaking: vi.fn().mockResolvedValue(undefined),
    acceptMatch: vi.fn().mockResolvedValue(undefined),
    clearToast: vi.fn(),
    ...overrides,
  };
}

function renderArenaPage(
  overrides: Partial<ComponentProps<typeof ArenaPageView>> = {},
  matchmakingOverrides: Partial<UseArenaMatchmakingResult> = {},
) {
  const data: ComponentProps<typeof ArenaPageView>["data"] = {
    viewer: {
      username: "lyosh",
      avatarUrl: "",
      eloRating: 1420,
      globalRank: 17,
      tier: "A",
    },
    stats: {
      totalMatches: 52,
      winRate: 0.65,
      wins: 34,
      maxWinStreak: 6,
    },
  };

  const matchmakingState = createMatchmakingState(matchmakingOverrides);
  arenaPageMocks.useArenaMatchmaking.mockReturnValue(matchmakingState);

  render(<ArenaPageView data={data} {...overrides} />);

  return matchmakingState;
}

describe("views/arena/ui/ArenaPageView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    document.documentElement.dataset.motion = "disabled";

    arenaPageMocks.useRouter.mockReturnValue({
      push: routerPushMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute("data-motion");
  });

  it("redirects to running match and auto-clears toast message", () => {
    const clearToast = vi.fn();

    renderArenaPage(
      {},
      {
        state: "searching",
        runningMatchId: "match-777",
        toastMessage: "Queue joined",
        clearToast,
      },
    );

    expect(routerPushMock).toHaveBeenCalledWith("/arena/match/match-777");
    expect(arenaPageMocks.ArenaQueueSettingsCard).toHaveBeenCalledWith(
      expect.objectContaining({
        isLocked: true,
      }),
    );
    expect(arenaPageMocks.ArenaAcceptOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        visible: false,
      }),
    );

    vi.advanceTimersByTime(3200);
    expect(clearToast).toHaveBeenCalledTimes(1);
  });

  it("wires queue and accept actions and exposes accept overlay in accept states", () => {
    const matchmakingState = renderArenaPage(
      {},
      {
        state: "pending_accept",
        selfAccepted: true,
        opponentAccepted: false,
      },
    );

    expect(arenaPageMocks.ArenaQueueSettingsCard).toHaveBeenCalledWith(
      expect.objectContaining({
        isLocked: false,
        queueSettings: matchmakingState.queueSettings,
        setTaskMode: matchmakingState.setTaskMode,
        setIsRated: matchmakingState.setIsRated,
      }),
    );

    expect(arenaPageMocks.ArenaQueueCtaPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        state: "pending_accept",
        isGuest: false,
        queueSettings: matchmakingState.queueSettings,
      }),
    );

    expect(arenaPageMocks.ArenaAcceptOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        visible: true,
        acceptRemainingSeconds: 30,
        selfAccepted: true,
        opponentAccepted: false,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(matchmakingState.startMatchmaking).toHaveBeenCalledTimes(1);
    expect(matchmakingState.cancelMatchmaking).toHaveBeenCalledTimes(1);
    expect(matchmakingState.acceptMatch).toHaveBeenCalledTimes(1);
  });
});
