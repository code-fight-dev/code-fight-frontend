import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { subscribeArenaEvents } from "@/entities/match/client";
import type { Match } from "@/entities/match";
import { createMatchFixture } from "@/test/entities/match/match.test-helpers";
import { useArenaRealtime } from "@/features/arena-matchmaking/model/realtime";

type MatchSnapshotSource = "sse" | "poll" | "action" | "bootstrap";

const matchClientMocks = vi.hoisted(() => ({
  subscribeArenaEvents: vi.fn(),
}));

vi.mock("@/entities/match/client", () => ({
  subscribeArenaEvents: matchClientMocks.subscribeArenaEvents,
}));

function RealtimeHarness({
  viewerId,
  onConnected,
  onQueued,
  onMatchSnapshot,
}: {
  viewerId: string | null;
  onConnected: (connected: boolean) => void;
  onQueued: () => void;
  onMatchSnapshot: (match: Match, source: MatchSnapshotSource) => void;
}) {
  useArenaRealtime({
    viewerId,
    onConnected,
    onQueued,
    onMatchSnapshot,
  });
  return null;
}

describe("useArenaRealtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not subscribe without viewer id", () => {
    render(
      <RealtimeHarness
        viewerId={null}
        onConnected={vi.fn()}
        onQueued={vi.fn()}
        onMatchSnapshot={vi.fn()}
      />,
    );

    expect(subscribeArenaEvents).not.toHaveBeenCalled();
  });

  it("maps events to callbacks", () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeArenaEvents).mockReturnValue(unsubscribe);

    const onConnected = vi.fn();
    const onQueued = vi.fn();
    const onMatchSnapshot = vi.fn();
    const match = createMatchFixture({
      status: "running",
      judgeStatus: "running",
      player1Ready: true,
      player2Ready: true,
      player1Score: 10,
      player2Score: 9,
      player1Attempts: 1,
      player2Attempts: 1,
    });

    render(
      <RealtimeHarness
        viewerId="viewer-1"
        onConnected={onConnected}
        onQueued={onQueued}
        onMatchSnapshot={onMatchSnapshot}
      />,
    );

    const subscribeInput = vi.mocked(subscribeArenaEvents).mock.calls[0]?.[0];
    if (!subscribeInput) {
      throw new Error("Expected subscribeArenaEvents to be called");
    }

    subscribeInput.onOpen?.();
    subscribeInput.onError?.();
    subscribeInput.onEvent({
      id: "event-1",
      type: "connected",
      data: {
        ok: false,
      },
    });
    subscribeInput.onEvent({
      id: "event-2",
      type: "matchmaking.queued",
      data: {
        status: "queued",
      },
    });
    subscribeInput.onEvent({
      id: "event-3",
      type: "match.started",
      data: match,
    });

    expect(onConnected).toHaveBeenNthCalledWith(1, true);
    expect(onConnected).toHaveBeenNthCalledWith(2, false);
    expect(onConnected).toHaveBeenNthCalledWith(3, false);
    expect(onQueued).toHaveBeenCalledTimes(1);
    expect(onMatchSnapshot).toHaveBeenCalledWith(match, "sse");
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeArenaEvents).mockReturnValue(unsubscribe);

    const { unmount } = render(
      <RealtimeHarness
        viewerId="viewer-1"
        onConnected={vi.fn()}
        onQueued={vi.fn()}
        onMatchSnapshot={vi.fn()}
      />,
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
