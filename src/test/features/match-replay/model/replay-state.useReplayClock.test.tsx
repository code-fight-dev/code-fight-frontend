import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useReplayClock } from "@/features/match-replay/model/replay-state/useReplayClock";

type ReplayClockParams = Parameters<typeof useReplayClock>[0];

function createParams(overrides: Partial<ReplayClockParams> = {}): ReplayClockParams {
  return {
    isPlaying: false,
    durationMs: 1000,
    safeCurrentTimeMs: 0,
    playbackSpeed: 1,
    setCurrentTimeMs: vi.fn(),
    setIsPlaying: vi.fn(),
    ...overrides,
  };
}

describe("features/match-replay/model/replay-state/useReplayClock", () => {
  let requestCallbacks = new Map<number, FrameRequestCallback>();
  let nextRequestId = 1;

  beforeEach(() => {
    requestCallbacks = new Map<number, FrameRequestCallback>();
    nextRequestId = 1;

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const requestId = nextRequestId;
      nextRequestId += 1;
      requestCallbacks.set(requestId, callback);
      return requestId;
    });

    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((requestId) => {
      requestCallbacks.delete(requestId);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function runFrame(now: number) {
    const pending = Array.from(requestCallbacks.values());
    requestCallbacks.clear();
    for (const callback of pending) {
      callback(now);
    }
  }

  it("does not schedule playback frames when paused or when duration is zero", () => {
    const { rerender } = renderHook(
      (params: ReplayClockParams) => useReplayClock(params),
      {
        initialProps: createParams({
          isPlaying: false,
          durationMs: 200,
        }),
      },
    );

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();

    rerender(
      createParams({
        isPlaying: true,
        durationMs: 0,
      }),
    );

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("advances time on animation frames and stops at duration boundary", () => {
    const setCurrentTimeMs = vi.fn();
    const setIsPlaying = vi.fn();

    renderHook((params: ReplayClockParams) => useReplayClock(params), {
      initialProps: createParams({
        isPlaying: true,
        durationMs: 100,
        safeCurrentTimeMs: 20,
        playbackSpeed: 1,
        setCurrentTimeMs,
        setIsPlaying,
      }),
    });

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      runFrame(10);
    });
    expect(setCurrentTimeMs).not.toHaveBeenCalled();

    act(() => {
      runFrame(40);
    });
    expect(setCurrentTimeMs).toHaveBeenLastCalledWith(50);

    act(() => {
      runFrame(90);
    });
    expect(setCurrentTimeMs).toHaveBeenLastCalledWith(100);
    expect(setIsPlaying).toHaveBeenCalledWith(false);
    expect(requestCallbacks.size).toBe(0);
  });

  it("uses latest playback speed and restarts from zero when current time is at duration", () => {
    const setCurrentTimeMs = vi.fn();

    const { rerender } = renderHook(
      (params: ReplayClockParams) => useReplayClock(params),
      {
        initialProps: createParams({
          isPlaying: true,
          durationMs: 100,
          safeCurrentTimeMs: 100,
          playbackSpeed: 1,
          setCurrentTimeMs,
        }),
      },
    );

    act(() => {
      runFrame(5);
    });

    rerender(
      createParams({
        isPlaying: true,
        durationMs: 100,
        safeCurrentTimeMs: 100,
        playbackSpeed: 2,
        setCurrentTimeMs,
      }),
    );

    act(() => {
      runFrame(15);
    });
    act(() => {
      runFrame(25);
    });

    expect(setCurrentTimeMs).toHaveBeenLastCalledWith(20);
  });

  it("cancels a scheduled frame on cleanup", () => {
    const setCurrentTimeMs = vi.fn();
    const { rerender, unmount } = renderHook(
      (params: ReplayClockParams) => useReplayClock(params),
      {
        initialProps: createParams({
          isPlaying: true,
          durationMs: 100,
          setCurrentTimeMs,
        }),
      },
    );

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    const staleFrame = Array.from(requestCallbacks.values())[0];

    rerender(
      createParams({
        isPlaying: false,
        durationMs: 100,
        setCurrentTimeMs,
      }),
    );
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      staleFrame?.(42);
    });
    expect(setCurrentTimeMs).not.toHaveBeenCalled();

    unmount();
  });
});
