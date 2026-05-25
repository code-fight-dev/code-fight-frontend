import { act, render } from "@testing-library/react";
import { useMemo } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMatchFixture } from "@/test/entities/match/match.test-helpers";
import {
  shouldPollState,
  useArenaPolling,
} from "@/features/arena-matchmaking/model/polling";

function PollingHarness({
  enabled,
  onPoll,
  intervalMs,
}: {
  enabled: boolean;
  onPoll: () => void;
  intervalMs?: number;
}) {
  const stableOnPoll = useMemo(() => onPoll, [onPoll]);
  useArenaPolling({
    enabled,
    onPoll: stableOnPoll,
    intervalMs,
  });
  return null;
}

describe("shouldPollState", () => {
  it("returns false when viewer id is missing", () => {
    expect(shouldPollState("searching", null, null)).toBe(false);
    expect(shouldPollState("idle", createMatchFixture(), null)).toBe(false);
  });

  it.each([
    "searching",
    "pending_accept",
    "accepting",
    "waiting_opponent",
    "starting",
  ] as const)("returns true for %s with authenticated viewer", (state) => {
    expect(shouldPollState(state, null, "viewer-1")).toBe(true);
  });

  it("returns true when match exists even in idle state", () => {
    expect(shouldPollState("idle", createMatchFixture(), "viewer-1")).toBe(true);
  });

  it("returns false for idle state without current match", () => {
    expect(shouldPollState("idle", null, "viewer-1")).toBe(false);
  });
});

describe("useArenaPolling", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks on interval when enabled", () => {
    vi.useFakeTimers();
    const onPoll = vi.fn();

    render(<PollingHarness enabled={true} onPoll={onPoll} intervalMs={100} />);

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(onPoll).toHaveBeenCalledTimes(3);
  });

  it("does not tick when disabled", () => {
    vi.useFakeTimers();
    const onPoll = vi.fn();

    render(<PollingHarness enabled={false} onPoll={onPoll} intervalMs={100} />);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onPoll).not.toHaveBeenCalled();
  });

  it("stops ticking after becoming disabled", () => {
    vi.useFakeTimers();
    const onPoll = vi.fn();

    const { rerender } = render(
      <PollingHarness enabled={true} onPoll={onPoll} intervalMs={100} />,
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender(<PollingHarness enabled={false} onPoll={onPoll} intervalMs={100} />);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onPoll).toHaveBeenCalledTimes(2);
  });
});
