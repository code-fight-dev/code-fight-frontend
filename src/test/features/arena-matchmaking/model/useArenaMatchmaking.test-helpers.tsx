import { vi } from "vitest";
import { useArenaMatchmaking } from "@/features/arena-matchmaking/model/useArenaMatchmaking";
import type { Match, QueueResult } from "@/entities/match";
import { createMatchFixture } from "@/test/entities/match/match.test-helpers";

const arenaMocks = vi.hoisted(() => ({
  useViewerSession: vi.fn(),
  getCurrentMatch: vi.fn(),
  joinMatchmakingQueue: vi.fn(),
  cancelMatchmakingQueue: vi.fn(),
  acceptMatchmakingMatch: vi.fn(),
  useArenaPolling: vi.fn(),
  useArenaRealtime: vi.fn(),
}));

export function getArenaMocks() {
  return arenaMocks;
}

vi.mock("@/entities/viewer", () => ({
  useViewerSession: arenaMocks.useViewerSession,
}));

vi.mock("@/entities/match/client", () => ({
  getCurrentMatch: arenaMocks.getCurrentMatch,
}));

vi.mock("@/features/arena-matchmaking/model/actions", () => ({
  joinMatchmakingQueue: arenaMocks.joinMatchmakingQueue,
  cancelMatchmakingQueue: arenaMocks.cancelMatchmakingQueue,
  acceptMatchmakingMatch: arenaMocks.acceptMatchmakingMatch,
}));

vi.mock("@/features/arena-matchmaking/model/realtime", () => ({
  useArenaRealtime: arenaMocks.useArenaRealtime,
}));

vi.mock("@/features/arena-matchmaking/model/polling", () => ({
  // Note: Keep polling deterministic in hook tests.
  //       shouldPollState itself is covered in polling.test.tsx.
  shouldPollState: (
    state: string,
    currentMatch: Match | null,
    viewerId: string | null,
  ): boolean =>
    Boolean(viewerId) &&
    (state === "searching" ||
      state === "pending_accept" ||
      state === "accepting" ||
      state === "waiting_opponent" ||
      state === "starting" ||
      Boolean(currentMatch)),
  useArenaPolling: arenaMocks.useArenaPolling,
}));

export type RealtimeInput = {
  viewerId: string | null;
  onConnected: (connected: boolean) => void;
  onQueued: () => void;
  onMatchSnapshot: (
    match: Match,
    source: "sse" | "poll" | "action" | "bootstrap",
  ) => void;
};

export type PollingInput = {
  enabled: boolean;
  onPoll: () => void;
  intervalMs?: number;
};

let latestRealtimeInput: RealtimeInput | null = null;
let latestPollingInput: PollingInput | null = null;

export function createViewer(id = "viewer-1") {
  return {
    id,
    email: `${id}@example.com`,
    username: id,
    createdAt: "2026-05-24T10:00:00.000Z",
  };
}

export function createMatch(overrides: Partial<Match> = {}): Match {
  return createMatchFixture(overrides);
}

export function resetUseArenaMatchmakingTestState() {
  latestRealtimeInput = null;
  latestPollingInput = null;

  vi.clearAllMocks();

  arenaMocks.useViewerSession.mockReturnValue({
    viewer: createViewer(),
  });

  arenaMocks.getCurrentMatch.mockResolvedValue({
    match: null,
  });

  arenaMocks.joinMatchmakingQueue.mockResolvedValue({
    status: "queued",
  } as QueueResult);

  arenaMocks.cancelMatchmakingQueue.mockResolvedValue(undefined);
  arenaMocks.acceptMatchmakingMatch.mockResolvedValue(
    createMatch({
      status: "running",
      player1Ready: true,
      player2Ready: true,
    }),
  );

  arenaMocks.useArenaRealtime.mockImplementation((input: RealtimeInput) => {
    latestRealtimeInput = input;
  });

  arenaMocks.useArenaPolling.mockImplementation((input: PollingInput) => {
    latestPollingInput = input;
  });
}

export function requireRealtimeInput() {
  if (!latestRealtimeInput) {
    throw new Error("Expected useArenaRealtime to receive callbacks");
  }

  return latestRealtimeInput;
}

export function requirePollingInput() {
  if (!latestPollingInput) {
    throw new Error("Expected useArenaPolling to receive callbacks");
  }

  return latestPollingInput;
}

export function getLatestPollingInput() {
  return latestPollingInput;
}

export function MatchmakingHarness() {
  const model = useArenaMatchmaking();

  return (
    <div>
      <span data-testid="viewer-id">{model.viewerId ?? "none"}</span>
      <span data-testid="state">{model.state}</span>
      <span data-testid="is-guest">{String(model.isGuest)}</span>
      <span data-testid="task-mode">{model.queueSettings.taskMode}</span>
      <span data-testid="is-rated">{String(model.queueSettings.isRated)}</span>
      <span data-testid="current-match-id">{model.currentMatch?.id ?? "none"}</span>
      <span data-testid="running-match-id">{model.runningMatchId ?? "none"}</span>
      <span data-testid="search-elapsed">{String(model.searchElapsedSeconds)}</span>
      <span data-testid="accept-remaining">{String(model.acceptRemainingSeconds)}</span>
      <span data-testid="self-accepted">{String(model.selfAccepted)}</span>
      <span data-testid="opponent-accepted">{String(model.opponentAccepted)}</span>
      <span data-testid="is-sse-connected">{String(model.isSseConnected)}</span>
      <span data-testid="is-busy">{String(model.isBusy)}</span>
      <span data-testid="error-message">{model.errorMessage ?? "none"}</span>
      <span data-testid="toast-message">{model.toastMessage ?? "none"}</span>

      <button type="button" onClick={() => model.setTaskMode("hard")}>
        set-hard
      </button>
      <button type="button" onClick={() => model.setIsRated(false)}>
        set-unrated
      </button>
      <button type="button" onClick={() => void model.startMatchmaking()}>
        start
      </button>
      <button type="button" onClick={() => void model.cancelMatchmaking()}>
        cancel
      </button>
      <button type="button" onClick={() => void model.acceptMatch()}>
        accept
      </button>
      <button type="button" onClick={model.clearToast}>
        clear-toast
      </button>
    </div>
  );
}
