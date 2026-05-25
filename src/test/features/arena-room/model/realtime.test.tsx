import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { subscribeArenaEvents } from "@/entities/match/client";
import type { Match } from "@/entities/match";
import {
  MATCH_POLL_INTERVAL_MS,
  useArenaRoomPolling,
  useArenaRoomRealtime,
} from "@/features/arena-room/model/realtime";
import { createArenaMatchFixture } from "./fixtures";

const realtimeMocks = vi.hoisted(() => ({
  subscribeArenaEvents: vi.fn(),
}));

vi.mock("@/entities/match/client", () => ({
  subscribeArenaEvents: realtimeMocks.subscribeArenaEvents,
}));

function RealtimeHarness({
  viewerId,
  matchId,
  onMatchSnapshot,
}: {
  viewerId: string | null;
  matchId: string;
  onMatchSnapshot: (match: Match) => void;
}) {
  useArenaRoomRealtime({
    viewerId,
    matchId,
    onMatchSnapshot,
  });
  return null;
}

function PollingHarness({ enabled, onPoll }: { enabled: boolean; onPoll: () => void }) {
  useArenaRoomPolling({ enabled, onPoll });
  return null;
}

describe("useArenaRoomRealtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not subscribe when viewer is missing", () => {
    render(
      <RealtimeHarness viewerId={null} matchId="match-1" onMatchSnapshot={vi.fn()} />,
    );
    expect(subscribeArenaEvents).not.toHaveBeenCalled();
  });

  it("does not subscribe when match id is empty after trim", () => {
    render(
      <RealtimeHarness viewerId="viewer-1" matchId="   " onMatchSnapshot={vi.fn()} />,
    );
    expect(subscribeArenaEvents).not.toHaveBeenCalled();
  });

  it("forwards only match snapshots for the current match id", () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeArenaEvents).mockReturnValue(unsubscribe);
    const onMatchSnapshot = vi.fn();
    const currentMatch = createArenaMatchFixture({ id: "match-1" });

    render(
      <RealtimeHarness
        viewerId="viewer-1"
        matchId=" match-1 "
        onMatchSnapshot={onMatchSnapshot}
      />,
    );

    const subscribeInput = vi.mocked(subscribeArenaEvents).mock.calls[0]?.[0];
    if (!subscribeInput) {
      throw new Error("Expected subscribeArenaEvents input");
    }

    subscribeInput.onEvent({
      id: null,
      type: "connected",
      data: { ok: true },
    });
    subscribeInput.onEvent({
      id: null,
      type: "matchmaking.queued",
      data: { status: "queued" },
    });
    subscribeInput.onEvent({
      id: "event-1",
      type: "match.started",
      data: createArenaMatchFixture({ id: "other-match" }),
    });
    subscribeInput.onEvent({
      id: "event-2",
      type: "match.progress",
      data: currentMatch,
    });

    expect(onMatchSnapshot).toHaveBeenCalledTimes(1);
    expect(onMatchSnapshot).toHaveBeenCalledWith(currentMatch);
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeArenaEvents).mockReturnValue(unsubscribe);

    const { unmount } = render(
      <RealtimeHarness viewerId="viewer-1" matchId="match-1" onMatchSnapshot={vi.fn()} />,
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe("useArenaRoomPolling", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls by interval while enabled", () => {
    vi.useFakeTimers();
    const onPoll = vi.fn();

    render(<PollingHarness enabled={true} onPoll={onPoll} />);

    act(() => {
      vi.advanceTimersByTime(MATCH_POLL_INTERVAL_MS * 3 + 200);
    });

    expect(onPoll).toHaveBeenCalledTimes(3);
  });

  it("does not poll when disabled", () => {
    vi.useFakeTimers();
    const onPoll = vi.fn();

    render(<PollingHarness enabled={false} onPoll={onPoll} />);

    act(() => {
      vi.advanceTimersByTime(MATCH_POLL_INTERVAL_MS * 3);
    });

    expect(onPoll).not.toHaveBeenCalled();
  });
});
