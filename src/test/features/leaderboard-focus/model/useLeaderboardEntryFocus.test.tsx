import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLeaderboardEntryFocus } from "@/features/leaderboard-focus/model/useLeaderboardEntryFocus";
import { mockMatchMedia } from "@/test/helpers/matchMedia";

const RETRY_DELAY_MS = 120;
const FOCUS_DURATION_MS = 2200;

describe("features/leaderboard-focus/model/useLeaderboardEntryFocus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does nothing when viewer id is not available", () => {
    const goToEntry = vi.fn();
    const getElementByIdSpy = vi.spyOn(document, "getElementById");

    const { result } = renderHook(() =>
      useLeaderboardEntryFocus({
        goToEntry,
        viewerUserId: null,
      }),
    );

    act(() => {
      result.current.handleJumpToMe();
      vi.advanceTimersByTime(0);
    });

    expect(goToEntry).not.toHaveBeenCalled();
    expect(getElementByIdSpy).not.toHaveBeenCalled();
    expect(result.current.focusedUserId).toBeNull();
  });

  it("does not queue scroll when goToEntry returns false", () => {
    mockMatchMedia(true);

    const goToEntry = vi.fn(() => false);
    const getElementByIdSpy = vi.spyOn(document, "getElementById");

    const { result } = renderHook(() =>
      useLeaderboardEntryFocus({
        goToEntry,
        viewerUserId: "viewer-1",
      }),
    );

    act(() => {
      result.current.handleJumpToMe();
      vi.advanceTimersByTime(0);
    });

    expect(goToEntry).toHaveBeenCalledWith("viewer-1");
    expect(getElementByIdSpy).not.toHaveBeenCalled();
    expect(result.current.focusedUserId).toBeNull();
  });

  it("scrolls to desktop entry, focuses it, then clears focus after timeout", () => {
    mockMatchMedia(true);

    const scrollIntoView = vi.fn();
    vi.spyOn(document, "getElementById").mockReturnValue({
      scrollIntoView,
    } as unknown as HTMLElement);

    const goToEntry = vi.fn(() => true);
    const { result } = renderHook(() =>
      useLeaderboardEntryFocus({
        goToEntry,
        viewerUserId: "viewer-1",
      }),
    );

    act(() => {
      result.current.handleJumpToMe();
      vi.advanceTimersByTime(0);
    });

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(result.current.focusedUserId).toBe("viewer-1");

    act(() => {
      vi.advanceTimersByTime(FOCUS_DURATION_MS);
    });

    expect(result.current.focusedUserId).toBeNull();
  });

  it("retries with mobile entry id until element appears", () => {
    mockMatchMedia(false);

    const scrollIntoView = vi.fn();
    const getElementByIdSpy = vi.spyOn(document, "getElementById");
    getElementByIdSpy
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ scrollIntoView } as unknown as HTMLElement);

    const goToEntry = vi.fn(() => true);
    const { result } = renderHook(() =>
      useLeaderboardEntryFocus({
        goToEntry,
        viewerUserId: "viewer-1",
      }),
    );

    act(() => {
      result.current.handleJumpToMe();
      vi.advanceTimersByTime(0);
    });

    expect(getElementByIdSpy).toHaveBeenNthCalledWith(
      1,
      "leaderboard-entry-mobile-viewer-1",
    );
    expect(scrollIntoView).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(RETRY_DELAY_MS);
    });

    expect(getElementByIdSpy).toHaveBeenNthCalledWith(
      2,
      "leaderboard-entry-mobile-viewer-1",
    );
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(result.current.focusedUserId).toBe("viewer-1");
  });

  it("cleans up scheduled focus timeout on unmount", () => {
    mockMatchMedia(true);

    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    vi.spyOn(document, "getElementById").mockReturnValue({
      scrollIntoView: vi.fn(),
    } as unknown as HTMLElement);

    const goToEntry = vi.fn(() => true);
    const { result, unmount } = renderHook(() =>
      useLeaderboardEntryFocus({
        goToEntry,
        viewerUserId: "viewer-1",
      }),
    );

    act(() => {
      result.current.handleJumpToMe();
      vi.advanceTimersByTime(0);
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
